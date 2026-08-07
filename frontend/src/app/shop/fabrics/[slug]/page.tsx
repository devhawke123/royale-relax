import { notFound } from 'next/navigation'
import { getFabricBySlug, getFabricCatalog, toDisplayFabrics } from '@/lib/fabrics'
import { FabricDetailClient } from '@/components/FabricDetailPage/FabricDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const fabric = await getFabricBySlug(slug)
  return { title: fabric ? `${fabric.name} Fabric | Royale Relax` : 'Fabric Sample | Royale Relax' }
}

export default async function FabricDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const raw = await getFabricBySlug(slug)
  if (!raw) return notFound()

  const [fabric] = toDisplayFabrics([raw])

  const allFabrics = await getFabricCatalog()
  const relatedFabrics = toDisplayFabrics(allFabrics)
    .filter((f) => f.slug !== slug)
    .slice(0, 4)
    .map((f) => ({
      slug: f.slug,
      name: f.name,
      image: f.swatches[0]?.image ?? '',
    }))

  return <FabricDetailClient fabric={fabric} relatedFabrics={relatedFabrics} />
}
