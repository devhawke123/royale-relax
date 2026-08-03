import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  const mapping: Record<string, string> = {
    'Small Double': "4' Small Double",
    'Double': "4'6 Double",
    'King': "5' King",
    'Super King': "6' Super King",
  }

  const oldSizes = Object.keys(mapping)
  const newSizes = Object.values(mapping)

  const countOldBefore = await prisma.productVariant.count({
    where: { size: { in: oldSizes } },
  })
  const countNewBefore = await prisma.productVariant.count({
    where: { size: { in: newSizes } },
  })

  console.log('Before rename:')
  console.log(`  old-size rows: ${countOldBefore}`)
  console.log(`  new-size rows: ${countNewBefore}`)

  for (const [oldSize, newSize] of Object.entries(mapping)) {
    const result = await prisma.productVariant.updateMany({
      where: { size: oldSize },
      data: { size: newSize },
    })
    console.log(`Updated ${result.count} rows: ${oldSize} -> ${newSize}`)
  }

  const countOldAfter = await prisma.productVariant.count({
    where: { size: { in: oldSizes } },
  })
  const countNewAfter = await prisma.productVariant.count({
    where: { size: { in: newSizes } },
  })

  console.log('After rename:')
  console.log(`  old-size rows: ${countOldAfter}`)
  console.log(`  new-size rows: ${countNewAfter}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
