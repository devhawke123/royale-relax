import { getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { FabricsPageClient } from '@/components/FabricsPage/FabricsPageClient'

export const metadata = {
  title: 'Fabric Samples | Royale Relax',
  description:
    'Order fabric samples from our full range of upholstery colourways before you commit to your next bed.',
}

export default async function FabricsPage() {
  const rawProducts = await getProductsByCategory('FABRICS')
  const products = rawProducts.map(toDisplayProduct)

  return <FabricsPageClient products={products} />
}
