import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../../generated/prisma/client'

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
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
