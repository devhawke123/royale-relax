import { prisma } from '@/lib/prisma'
import { toDisplayProduct, productWithColorsInclude } from '@/lib/products'
import { BedsPageClient } from '@/components/BedsPage/BedsPageClient'

// Prisma reads aren't fetch-tracked, so without this the route gets
// statically cached on first request and admin edits never show up until
// the next deploy.
export const revalidate = 0

export const metadata = {
  title: 'Storage Beds | Royale Relax',
  description:
    'Browse our storage beds collection. Handcrafted storage beds for elegant, space-saving designs.',
}

export default async function StorageBedsPage() {
  const rawProducts = await prisma.product.findMany({
    where: { category: 'BEDS', status: 'PUBLISHED', hasStorage: true, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: productWithColorsInclude,
  })

  const products = rawProducts.map(toDisplayProduct)

  return <BedsPageClient products={products} initialFilter="storage" serverFiltered />
}
