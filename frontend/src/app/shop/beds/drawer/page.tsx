import { prisma } from '@/lib/prisma'
import { toDisplayProduct } from '@/lib/products'
import { BedsPageClient } from '@/components/BedsPage/BedsPageClient'

export const metadata = {
  title: 'Drawer Beds | Royale Relax',
  description:
    'Browse our drawer beds collection. Elegant drawer beds with integrated storage for a tidy bedroom.',
}

export default async function DrawerBedsPage() {
  const rawProducts = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED', hasDrawer: true },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { sortOrder: 'asc' as const } },
      sizes: { orderBy: { sortOrder: 'asc' as const } },
    },
  })

  const products = rawProducts.map(toDisplayProduct)

  return <BedsPageClient products={products} initialFilter="drawer" serverFiltered />
}
