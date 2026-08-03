import { prisma } from '@/lib/prisma'
import { getImageUrl } from '@/lib/media'
import type { Product as DisplayProduct, ProductCategory } from '@/types/product'
import type { Category } from '../../generated/prisma/enums'

const productWithColorsInclude = {
  colors: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      images: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  variants: { orderBy: { size: 'asc' as const } },
}

export function getFeaturedProducts(limit: number) {
  return prisma.product.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: productWithColorsInclude,
  })
}

export function getProductsByCategory(category: Category) {
  return prisma.product.findMany({
    where: { category, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: productWithColorsInclude,
  })
}


export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productWithColorsInclude,
  })
}

/**
 * Fetches products by slug and returns them in the exact order (and with the
 * exact repeats) given in `slugs` — for hand-curated sections (e.g. featured
 * picks, best sellers) where DB order doesn't reflect editorial intent.
 * Unknown slugs are silently skipped.
 */
export async function getProductsBySlugsInOrder(slugs: string[]) {
  const uniqueSlugs = [...new Set(slugs)]
  const products = await prisma.product.findMany({
    where: { slug: { in: uniqueSlugs } },
    include: productWithColorsInclude,
  })
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is NonNullable<typeof product> => product !== undefined)
}

type ProductWithImages = Awaited<ReturnType<typeof getFeaturedProducts>>[number]

function getProductImages(product: ProductWithImages) {
  return product.colors.flatMap((color) => color.images)
}

const categoryToDisplay: Record<Category, ProductCategory> = {
  BEDS: 'bed',
  FABRICS: 'fabric',
  MATTRESSES: 'mattress',
}

/**
 * Adapts a DB product into the shape the UI components expect. Variant and
 * basePrice fields are included so listing/detail pages can show prices.
 * Variant prices default to 0 (per migration) and the UI must handle that.
 */
export function toDisplayProduct(product: ProductWithImages): DisplayProduct {
  const productImages = getProductImages(product)
  const mainImage = productImages.find((image) => image.isMain) ?? productImages[0]
  const images = mainImage
    ? [mainImage, ...productImages.filter((image) => image !== mainImage)]
    : productImages

  const variants = (product as any).variants?.map((v: any) => ({
    id: v.id,
    productId: product.id,
    sku: v.sku ?? '',
    size: v.size,
    price: Number(v.price ?? 0),
    inStock: !!v.inStock,
  })) ?? []

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: categoryToDisplay[product.category],
    images: images.map((image) => getImageUrl(image.path)),
    variants,
    basePrice: Number((product as any).basePrice ?? 0),
    hasStorage: Boolean((product as any).hasStorage),
    hasDrawer: Boolean((product as any).hasDrawer),
    createdAt: product.createdAt.toISOString(),
  }
}
