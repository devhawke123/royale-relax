import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
  const storage = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED', hasStorage: true },
    select: { id: true, name: true, slug: true, hasStorage: true, hasDrawer: true },
    orderBy: { name: 'asc' as const },
  })

  console.log(`Storage beds found: ${storage.length}`)
  console.table(storage)

  const drawer = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED', hasDrawer: true },
    select: { id: true, name: true, slug: true, hasStorage: true, hasDrawer: true },
    orderBy: { name: 'asc' as const },
  })

  console.log(`Drawer beds found: ${drawer.length}`)
  console.table(drawer)

  const allBeds = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED' },
    select: { id: true, name: true, slug: true, hasStorage: true, hasDrawer: true },
    orderBy: { name: 'asc' as const },
  })

  console.log(`All published beds: ${allBeds.length}`)
  console.table(allBeds)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect().finally(() => process.exit(1)) })
