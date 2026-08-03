import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
  const drawerNames = [
    'Kendal Divan Bed',
    'Luxe Divan Bed',
    'Madison Divan Bed',
  ]

  const storageNames = [
    'Versailles Bed',
    'Grand Regent Bed',
    'Kensington Bed',
    'Heritage Elite Bed',
    'Grand Royale Bed',
    'Velvet Dawn Bed',
    'Majestic Bed',
    'Celestia Bed',
    'Harington Bed',
    'Savoy Imperial Bed',
    'Balmoral Bed',
    'Royale Signature Bed',
    'Ellington Bed',
    'Eminence Bed',
    'Kendal Divan Bed',
    'Luxe Divan Bed',
    'Madison Divan Bed',
    'Montrose Bed',
    'Regent Bed',
    'Valencia Wing Bed',
  ]

  console.log('Setting hasDrawer for drawer beds...')
  const drawerRes = await prisma.product.updateMany({
    where: { name: { in: drawerNames }, category: 'BEDS' },
    data: { hasDrawer: true },
  })
  console.log(`hasDrawer updated on ${drawerRes.count} product(s)`) 

  console.log('Setting hasStorage for storage beds...')
  const storageRes = await prisma.product.updateMany({
    where: { name: { in: storageNames }, category: 'BEDS' },
    data: { hasStorage: true },
  })
  console.log(`hasStorage updated on ${storageRes.count} product(s)`) 

  // Optionally show which products were updated (names)
  const updated = await prisma.product.findMany({
    where: { category: 'BEDS', OR: [{ hasDrawer: true }, { hasStorage: true }] },
    select: { name: true, hasDrawer: true, hasStorage: true },
    orderBy: { name: 'asc' },
  })

  console.table(updated)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
