import { getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { BedsPageClient } from '@/components/BedsPage/BedsPageClient'

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

