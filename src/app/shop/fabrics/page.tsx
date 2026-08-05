import { getFabricCatalog, toDisplayFabrics } from '@/lib/fabrics'
import { FabricsPageClient } from '@/components/FabricsPage/FabricsPageClient'

export const metadata = {
  title: 'Fabric Samples | Royale Relax',
  description:
    'Order fabric samples from our full range of upholstery colourways before you commit to your next bed.',
}

export default async function FabricsPage() {
  const fabrics = await getFabricCatalog()
  const displayFabrics = toDisplayFabrics(fabrics)
  const samples = displayFabrics.map((fabric) => ({
    slug: fabric.slug,
    name: fabric.name,
    image: fabric.swatches[0]?.image ?? '',
  }))

  return <FabricsPageClient samples={samples} />
}
