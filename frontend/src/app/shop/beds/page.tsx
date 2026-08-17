import { getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { BedsPageClient } from '@/components/BedsPage/BedsPageClient'

// Prisma reads aren't fetch-tracked, so without this the route gets
// statically cached on first request and admin edits (price, stock, new
// products) never show up until the next deploy.
export const revalidate = 0

export const metadata = {
  title: 'Beds | Royale Relax',
  description:
    'Browse our full collection of handcrafted luxury beds. Storage beds, drawer beds, and more — designed for elegance and comfort.',
}

export default async function BedsPage() {
  const rawProducts = await getProductsByCategory('BEDS')
  const products = rawProducts.map(toDisplayProduct)

  return <BedsPageClient products={products} />
}

