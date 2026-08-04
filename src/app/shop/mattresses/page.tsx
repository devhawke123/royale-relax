import { getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { MattressesPageClient } from '@/components/MattressesPage/MattressesPageClient'

export const metadata = {
  title: 'Mattresses | Royale Relax',
  description: 'Shop our collection of luxury pocket, hybrid and memory foam mattresses.',
}

export default async function MattressesPage() {
  const rawProducts = await getProductsByCategory('MATTRESSES')
  const products = rawProducts.map(toDisplayProduct)

  return <MattressesPageClient products={products} />
}
