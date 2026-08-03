import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { toDisplayProduct } from '../src/lib/products'

async function main() {
  const rawProducts = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED', hasStorage: true },
    orderBy: { createdAt: 'desc' },
    include: {
      colors: { orderBy: { sortOrder: 'asc' as const }, include: { images: { orderBy: { sortOrder: 'asc' as const } } } },
      variants: { orderBy: { size: 'asc' as const } },
    },
  })

  console.log('rawProducts length', rawProducts.length)
  const products = rawProducts.map((p) => toDisplayProduct(p as any))
  console.log('mapped products length', products.length)
  console.dir(products.slice(0,2), { depth: 4 })
}

main().then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect().finally(() => process.exit(1)) })
