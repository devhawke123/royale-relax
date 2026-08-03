import { prisma } from '@/lib/prisma'
import { toDisplayProduct } from '@/lib/products'
import { BedsPageClient } from '@/components/BedsPage/BedsPageClient'

export const metadata = {
  title: 'Storage Beds | Royale Relax',
  description:
    'Browse our storage beds collection. Handcrafted storage beds for elegant, space-saving designs.',
}

export default async function StorageBedsPage() {
  const rawProducts = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED', hasStorage: true },
    orderBy: { createdAt: 'desc' },
    include: {
      colors: {
        orderBy: { sortOrder: 'asc' as const },
        include: { images: { orderBy: { sortOrder: 'asc' as const } } },
      },
      variants: { orderBy: { size: 'asc' as const } },
    },
  })

  const products = rawProducts.map(toDisplayProduct)

  return <BedsPageClient products={products} initialFilter="storage" serverFiltered />
}
