/**
 * DEV ONLY — mint an admin password-reset link without email.
 *
 *   npx tsx scripts/admin-reset-link.ts admin@royalerelax.com
 *
 * Prints a /reset-password?token=... URL. Same 1h single-use token the
 * /api/auth/admin/forgot-password route would create. Invalidates the admin's
 * earlier unused reset tokens, exactly like the real endpoint.
 */
import 'dotenv/config'
import crypto from 'node:crypto'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('usage: npx tsx scripts/admin-reset-link.ts <admin-email>')
  process.exit(1)
}

const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const MYSQL_URL = process.env.MYSQL_DATABASE_URL ?? 'mysql://root:test@localhost:3306/myapp'
const u = new URL(MYSQL_URL)

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    allowPublicKeyRetrieval: true,
  }),
})

;(async () => {
  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin) {
    console.error(`No admin user with email ${email}`)
    process.exit(1)
  }

  const raw = crypto.randomBytes(32).toString('base64url')
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex')

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { adminUserId: admin.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash,
        adminUserId: admin.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    }),
  ])

  console.log(`\nReset link for ${email} (valid 1 hour, single use):\n`)
  console.log(`${SITE_URL}/reset-password?token=${encodeURIComponent(raw)}\n`)

  await prisma.$disconnect()
})().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect().catch(() => {})
  process.exit(1)
})
