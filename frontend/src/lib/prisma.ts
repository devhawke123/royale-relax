import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const url = new URL(process.env.DATABASE_URL ?? '')

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  // Treat DATETIME columns as UTC so values round-trip unchanged and match the
  // data imported from Neon (which was stored as UTC wall-clock).
  timezone: 'Z',
  // MySQL 8.4 defaults to caching_sha2_password; a cold-cache auth over an
  // unencrypted local connection needs the server's public key. Local dev only.
  allowPublicKeyRetrieval: true,
  // Force character_set_client, _connection and _results to one collation on
  // every connection. Without this they disagree, so the `CONCAT('%', ?, '%')`
  // Prisma builds for `contains` mixes collations and MySQL throws
  // "Illegal mix of collations" (1267) on every LIKE query. Must match the
  // column collation (utf8mb4_unicode_ci).
  initSql: "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
