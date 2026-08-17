import { getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { MattressesPageClient } from '@/components/MattressesPage/MattressesPageClient'

// Prisma reads aren't fetch-tracked, so without this the route gets
// statically cached on first request and admin edits never show up until
// the next deploy.
export const revalidate = 0

export const metadata = {
  title: 'Mattresses | Royale Relax',
  description: 'Shop our collection of luxury pocket, hybrid and memory foam mattresses.',
}

export default async function MattressesPage() {
  const rawProducts = await getProductsByCategory('MATTRESSES')
  const products = rawProducts.map(toDisplayProduct)

  return <MattressesPageClient products={products} />
}
