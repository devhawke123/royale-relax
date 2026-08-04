import { getProductBySlug, getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { BedDetailClient } from '@/components/BedDetailPage/BedDetailClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const raw = await getProductBySlug(slug)
  return { title: raw ? `${raw.name} | Royale Relax` : 'Bed | Royale Relax' }
}

export default async function BedDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const raw = await getProductBySlug(slug)
  if (!raw || raw.category !== 'BEDS') return notFound()

  const product = toDisplayProduct(raw)

  // The Figma design's "Choose Fabric" swatch grid isn't backed by a
  // bed-to-fabric relationship in the schema yet, so it's stood in for here
  // using one real fabric family's colourways from the Fabrics catalog.
  const fabricProducts = await getProductsByCategory('FABRICS')
  const fabricSource = fabricProducts.find((f) => f.slug === 'naple') ?? fabricProducts[0]
  const fabricSwatches = fabricSource
    ? (toDisplayProduct(fabricSource).colors ?? [])
        .filter((c) => !/^rectangle/i.test(c.name))
        .map((c) => ({ id: c.id, name: c.name, image: c.images[0] }))
        .filter((c): c is { id: string; name: string; image: string } => Boolean(c.image))
    : []

  return <BedDetailClient product={product} fabricSwatches={fabricSwatches} />
}
