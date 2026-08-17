import { getProductBySlug, getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { MattressDetailClient } from '@/components/MattressDetailPage/MattressDetailClient'
import { notFound } from 'next/navigation'

// Prisma reads aren't fetch-tracked, so without this the route gets
// statically cached on first request and admin edits (price, etc.) never
// show up until the next deploy.
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const raw = await getProductBySlug(slug)
  return { title: raw ? `${raw.name} | Royale Relax` : 'Mattress | Royale Relax' }
}

export default async function MattressDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const raw = await getProductBySlug(slug)
  if (!raw || raw.category !== 'MATTRESSES') return notFound()

  const product = toDisplayProduct(raw)

  const otherMattresses = await getProductsByCategory('MATTRESSES')
  const relatedProducts = otherMattresses
    .filter((m) => m.slug !== slug)
    .slice(0, 4)
    .map(toDisplayProduct)

  return <MattressDetailClient product={product} relatedProducts={relatedProducts} />
}
