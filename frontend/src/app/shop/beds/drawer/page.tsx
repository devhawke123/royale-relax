import { prisma } from '@/lib/prisma'
import { toDisplayProduct, productWithColorsInclude } from '@/lib/products'
import { BedsPageClient } from '@/components/BedsPage/BedsPageClient'

export const metadata = {
  title: 'Drawer Beds | Royale Relax',
  description:
    'Browse our drawer beds collection. Elegant drawer beds with integrated storage for a tidy bedroom.',
}

export default async function DrawerBedsPage() {
  const rawProducts = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED', hasDrawer: true, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: productWithColorsInclude,
  })

  const products = rawProducts.map(toDisplayProduct)

  return <BedsPageClient products={products} initialFilter="drawer" serverFiltered />
}
