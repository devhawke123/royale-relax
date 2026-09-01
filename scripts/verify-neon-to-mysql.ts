process.env.TZ = 'UTC'
import 'dotenv/config'
import pg from 'pg'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED })
const mu = new URL(process.env.MYSQL_DATABASE_URL ?? 'mysql://root:test@localhost:3306/myapp')
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: mu.hostname,
    port: mu.port ? Number(mu.port) : 3306,
    user: decodeURIComponent(mu.username),
    password: decodeURIComponent(mu.password),
    database: mu.pathname.replace(/^\//, ''),
    timezone: 'Z',
    allowPublicKeyRetrieval: true,
  }),
})

const TABLES = [
  'Product', 'Customer', 'AdminUser', 'StoreSettings', 'StripeWebhookEvent',
  'ProductImage', 'ProductSize', 'ProductAddon', 'FabricColor', 'BedOfTheWeek',
  'ProductAddonOption', 'Order', 'OrderItem', 'OrderItemAddon', 'RefreshToken',
]

;(async () => {
  console.log('== Independent row-count comparison ==')
  let mismatches = 0
  for (const t of TABLES) {
    const pgN = Number((await pool.query(`SELECT count(*)::int n FROM "${t}"`)).rows[0].n)
    const myN = Number(
      (await prisma.$queryRawUnsafe<{ n: bigint | number }[]>(
        `SELECT count(*) n FROM \`${t}\``,
      ))[0].n,
    )
    const ok = pgN === myN
    if (!ok) mismatches++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${t.padEnd(20)} neon=${pgN} mysql=${myN}`)
  }

  console.log('\n== Spot-check: Order dates + decimals ==')
  const oPg = (await pool.query(
    `SELECT id, "orderNumber", "createdAt", "paidAt", total, subtotal FROM "Order" ORDER BY "createdAt" LIMIT 3`,
  )).rows
  for (const row of oPg) {
    const my = await prisma.order.findUnique({ where: { id: row.id } })
    console.log(`\norder ${row.orderNumber}`)
    console.log(`  createdAt  neon=${row.createdAt?.toISOString()}  mysql=${my?.createdAt.toISOString()}`)
    console.log(`  paidAt     neon=${row.paidAt?.toISOString() ?? null}  mysql=${my?.paidAt?.toISOString() ?? null}`)
    console.log(`  total      neon=${row.total}  mysql=${my?.total.toString()}`)
    console.log(`  subtotal   neon=${row.subtotal}  mysql=${my?.subtotal.toString()}`)
  }

  console.log('\n== Spot-check: base64 image payload integrity (ProductImage.path) ==')
  const imgPg = (await pool.query(
    `SELECT id, length("path") len, md5("path") h FROM "ProductImage" ORDER BY length("path") DESC LIMIT 3`,
  )).rows
  for (const row of imgPg) {
    const my = await prisma.productImage.findUnique({ where: { id: row.id } })
    const myLen = my?.path.length ?? 0
    const crypto = await import('node:crypto')
    const myHash = crypto.createHash('md5').update(my?.path ?? '').digest('hex')
    console.log(
      `  ${row.id}  len neon=${row.len} mysql=${myLen}  md5 ${row.h === myHash ? 'MATCH' : 'DIFFER'}`,
    )
  }

  console.log('\n== Spot-check: Product enums + long description ==')
  const pPg = (await pool.query(
    `SELECT id, slug, category, status, length("description") dlen FROM "Product" ORDER BY length("description") DESC LIMIT 3`,
  )).rows
  for (const row of pPg) {
    const my = await prisma.product.findUnique({ where: { id: row.id } })
    console.log(
      `  ${row.slug.padEnd(28)} cat neon=${row.category}/mysql=${my?.category}  status ${row.status}/${my?.status}  descLen ${row.dlen}/${my?.description.length}`,
    )
  }

  await pool.end()
  await prisma.$disconnect()
  process.exit(mismatches === 0 ? 0 : 1)
})()
