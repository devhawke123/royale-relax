import { getProductBySlug, getProductsByCategory, toDisplayProduct } from '@/lib/products'
import { getFabricCatalog, toDisplayFabrics } from '@/lib/fabrics'
import { BedDetailClient } from '@/components/BedDetailPage/BedDetailClient'
import { notFound } from 'next/navigation'

// Prisma reads aren't fetch-tracked, so without this the route gets
// statically cached on first request and admin edits (price, configurations,
// etc.) never show up until the next deploy.
export const revalidate = 0

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

  // "Choose Fabric" is backed by the Fabric catalog: each Fabric row is a
  // fabric type (Chenille, Crushed Velvet, ...) and its FabricColor rows are
  // that fabric's colour variants. Fetch the whole catalog here so the
  // client can filter swatches by fabric type in real time.
  const fabricCatalog = await getFabricCatalog()
  const fabrics = toDisplayFabrics(fabricCatalog)

  const otherBeds = await getProductsByCategory('BEDS')
  const relatedProducts = otherBeds
    .filter((b) => b.slug !== slug)
    .slice(0, 4)
    .map(toDisplayProduct)

  return <BedDetailClient product={product} fabrics={fabrics} relatedProducts={relatedProducts} />
}
