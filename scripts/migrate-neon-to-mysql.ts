/**
 * One-off DRY-RUN data migration: Neon Postgres  ->  local Docker MySQL.
 *
 *   READ  side: `pg` pool against Neon, opened READ ONLY. Never written to.
 *   WRITE side: Prisma Client against the local Docker MySQL (mysql://root:test@localhost:3306/myapp).
 *
 * Tables are copied in foreign-key dependency order (parents before children).
 * Every id in this schema is a uuid() string, so there are no AUTO_INCREMENT
 * counters to reset — that step from the generic playbook does not apply here.
 *
 * Usage:
 *   NEON_DATABASE_URL=postgresql://...neon...   (defaults to DATABASE_URL_UNPOOLED / DATABASE_URL from .env)
 *   MYSQL_DATABASE_URL=mysql://root:test@localhost:3306/myapp   (default)
 *   npx tsx scripts/migrate-neon-to-mysql.ts
 */
// Force the whole process to UTC before any DB driver loads. Both node-postgres
// and the mariadb driver localize naive timestamps through process.env.TZ; with
// TZ=UTC the read side and the write side agree and DATETIME values round-trip
// unchanged.
process.env.TZ = 'UTC'

import 'dotenv/config'
import pg, { Pool } from 'pg'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

// node-postgres parses `timestamp without time zone` (oid 1114) into a JS Date
// using the *local* timezone, which silently shifts values. Neon stores these
// columns as UTC wall-clock, so force UTC parsing.
pg.types.setTypeParser(1114, (v) => new Date(v + 'Z'))

const NEON_URL =
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL

const MYSQL_URL =
  process.env.MYSQL_DATABASE_URL ?? 'mysql://root:test@localhost:3306/myapp'

if (!NEON_URL || !NEON_URL.startsWith('postgres')) {
  throw new Error('NEON source URL missing or not a postgres:// URL')
}

const pool = new Pool({ connectionString: NEON_URL, max: 4 })

// Build an explicit mariadb pool config so we can pin the session timezone to
// UTC. Without `timezone: 'Z'` the driver reinterprets JS Dates through the
// machine's local zone on write and stores a shifted wall-clock in DATETIME.
function mysqlConfig(url: string) {
  const u = new URL(url)
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    timezone: 'Z',
    allowPublicKeyRetrieval: true,
  }
}

const mysqlAdapter = new PrismaMariaDb(mysqlConfig(MYSQL_URL))
const prisma = new PrismaClient({ adapter: mysqlAdapter })

/**
 * Copy order = FK dependency order. Each entry maps the Postgres table name to
 * the Prisma delegate used to write into MySQL, plus an optional row transform
 * for inline type conversions.
 */
type TableSpec = {
  table: string
  delegate: { createMany: (args: any) => Promise<{ count: number }> }
  transform?: (row: Record<string, unknown>) => Record<string, unknown>
}

const PLAN: TableSpec[] = [
  // 1 — no FK dependencies
  { table: 'Product', delegate: prisma.product },
  { table: 'Customer', delegate: prisma.customer },
  { table: 'AdminUser', delegate: prisma.adminUser },
  { table: 'StoreSettings', delegate: prisma.storeSettings },
  { table: 'StripeWebhookEvent', delegate: prisma.stripeWebhookEvent },
  // 2 — depend on Product
  { table: 'ProductImage', delegate: prisma.productImage },
  { table: 'ProductSize', delegate: prisma.productSize },
  { table: 'ProductAddon', delegate: prisma.productAddon },
  { table: 'FabricColor', delegate: prisma.fabricColor },
  { table: 'BedOfTheWeek', delegate: prisma.bedOfTheWeek },
  // 3 — depends on ProductAddon
  { table: 'ProductAddonOption', delegate: prisma.productAddonOption },
  // 4 — depends on Customer
  { table: 'Order', delegate: prisma.order },
  // 5 — depends on Order, Product, ProductSize, FabricColor
  { table: 'OrderItem', delegate: prisma.orderItem },
  // 6 — depends on OrderItem
  { table: 'OrderItemAddon', delegate: prisma.orderItemAddon },
  // 7 — depends on Customer, AdminUser
  { table: 'RefreshToken', delegate: prisma.refreshToken },
]

// Kept small: ProductImage.path / OrderItem.imagePath hold base64 data URIs up
// to ~9 MB each, so large batches would blow past max_allowed_packet.
const CHUNK = 20

async function copyTable(spec: TableSpec): Promise<{ source: number; written: number }> {
  const { rows } = await pool.query(`SELECT * FROM "${spec.table}"`)
  const source = rows.length
  if (source === 0) return { source: 0, written: 0 }

  const data = spec.transform ? rows.map(spec.transform) : rows

  let written = 0
  for (let i = 0; i < data.length; i += CHUNK) {
    const slice = data.slice(i, i + CHUNK)
    const res = await spec.delegate.createMany({ data: slice })
    written += res.count
  }
  return { source, written }
}

async function main() {
  console.log(`Source (Neon, read-only): ${NEON_URL!.replace(/:\/\/[^@]*@/, '://***@')}`)
  console.log(`Target (local MySQL):     ${MYSQL_URL.replace(/:\/\/[^@]*@/, '://***@')}`)
  console.log('')

  // Prove the source session cannot write.
  await pool.query('SET SESSION default_transaction_read_only = on')

  // Make the target a clean slate so the script is safely re-runnable.
  // DELETE (not TRUNCATE) in child -> parent order so existing FKs stay satisfied
  // at every step; runs in one transaction on a single connection.
  await prisma.$transaction(
    [...PLAN].reverse().map((spec) =>
      prisma.$executeRawUnsafe(`DELETE FROM \`${spec.table}\``),
    ),
  )

  const summary: Array<{ table: string; source: number; written: number; ok: boolean }> = []

  for (const spec of PLAN) {
    process.stdout.write(`  ${spec.table.padEnd(22)} ... `)
    try {
      const { source, written } = await copyTable(spec)
      const ok = source === written
      summary.push({ table: spec.table, source, written, ok })
      console.log(`${written}/${source} rows ${ok ? 'OK' : 'MISMATCH'}`)
    } catch (err) {
      summary.push({ table: spec.table, source: -1, written: -1, ok: false })
      console.log('ERROR')
      console.error(err)
    }
  }

  console.log('\n================ SUMMARY ================')
  let totalSrc = 0
  let totalDst = 0
  let allOk = true
  for (const r of summary) {
    totalSrc += Math.max(r.source, 0)
    totalDst += Math.max(r.written, 0)
    if (!r.ok) allOk = false
    console.log(
      `${r.ok ? '  ok ' : ' FAIL'}  ${r.table.padEnd(22)} neon=${r.source}  mysql=${r.written}`,
    )
  }
  console.log('----------------------------------------')
  console.log(`  totals  neon=${totalSrc}  mysql=${totalDst}`)
  console.log(allOk ? '  ALL TABLES MATCH' : '  MISMATCHES PRESENT - see FAIL rows above')

  await pool.end()
  await prisma.$disconnect()
  process.exit(allOk ? 0 : 1)
}

main().catch(async (err) => {
  console.error(err)
  await pool.end().catch(() => {})
  await prisma.$disconnect().catch(() => {})
  process.exit(1)
})
