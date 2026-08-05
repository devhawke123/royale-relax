import { prisma } from '@/lib/prisma'
import { getImageUrl } from '@/lib/media'

export function getFabricCatalog() {
  return prisma.fabric.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      colors: { orderBy: { sortOrder: 'asc' } },
    },
  })
}

export function getFabricBySlug(slug: string) {
  return prisma.fabric.findUnique({
    where: { slug },
    include: {
      colors: { orderBy: { sortOrder: 'asc' } },
    },
  })
}

type FabricCatalog = Awaited<ReturnType<typeof getFabricCatalog>>

export function toDisplayFabrics(fabrics: FabricCatalog) {
  return fabrics.map((fabric) => ({
    id: fabric.id,
    slug: fabric.slug,
    name: fabric.name,
    swatches: fabric.colors.map((color) => ({
      id: color.id,
      code: color.code,
      name: color.colorName,
      image: getImageUrl(color.imagePath),
    })),
  }))
}
