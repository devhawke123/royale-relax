import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getImageUrl } from '@/lib/media'

// Fabric families are Product rows with category = FABRICS. They're kept
// status = DRAFT (the fabric shop isn't part of the storefront's normal
// PUBLISHED listing yet), so these queries deliberately do NOT filter by
// status — that filter belongs to the bed/mattress storefront queries only.
// DISCONTINUED colourways and soft-deleted fabric products are excluded —
// every bed's swatch picker is this same query, so it's cached.
const fetchFabricCatalog = () =>
  prisma.product.findMany({
    where: { category: 'FABRICS', deletedAt: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      fabricColors: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
    },
  })

export const getFabricCatalog = unstable_cache(fetchFabricCatalog, ['fabric-catalog'], {
  tags: ['fabric-catalog'],
})

export function getFabricBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, category: 'FABRICS', deletedAt: null },
    include: {
      fabricColors: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
    },
  })
}

type FabricCatalog = Awaited<ReturnType<typeof getFabricCatalog>>

export function toDisplayFabrics(fabrics: FabricCatalog) {
  return fabrics.map((fabric) => ({
    id: fabric.id,
    slug: fabric.slug,
    name: fabric.name,
    swatches: fabric.fabricColors.map((color) => ({
      id: color.id,
      code: color.code,
      name: color.colorName,
      image: getImageUrl(color.imagePath),
      description: color.description,
    })),
  }))
}
