import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'
import bcrypt from 'bcryptjs'

const url = new URL(process.env.DATABASE_URL ?? 'mysql://root:test@localhost:3306/myapp')
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  allowPublicKeyRetrieval: true,
})
const prisma = new PrismaClient({ adapter })

const TEST_ADMIN_EMAIL = 'admin@royalerelax.co.uk'
const TEST_ADMIN_PASSWORD = 'RoyaleAdmin123!'

async function main() {
  const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 12)

  await prisma.adminUser.upsert({
    where: { email: TEST_ADMIN_EMAIL },
    update: {},
    create: {
      name: 'Test Admin',
      email: TEST_ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
    },
  })
  console.log(`Seeded admin user: ${TEST_ADMIN_EMAIL} / ${TEST_ADMIN_PASSWORD}`)

  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Royale Relax',
      email: TEST_ADMIN_EMAIL,
      phone: '+1 (555) 000-1234',
    },
  })
  console.log('Seeded default store settings')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
