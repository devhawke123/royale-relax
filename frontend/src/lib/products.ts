import { prisma } from '@/lib/prisma'
import { getImageUrl } from '@/lib/media'
import { finalPrice } from '@/lib/pricing'
import type { Product as DisplayProduct, ProductCategory } from '@/types/product'
import type { Category } from '../../../generated/prisma/enums'

export const productWithColorsInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  sizes: { orderBy: { sortOrder: 'asc' as const } },
  addons: {
    orderBy: { sortOrder: 'asc' as const },
    include: { options: { orderBy: { sortOrder: 'asc' as const } } },
  },
}

export function getFeaturedProducts(limit: number) {
  return prisma.product.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: productWithColorsInclude,
  })
}

export function getProductsByCategory(category: Category) {
  return prisma.product.findMany({
    where: { category, status: 'PUBLISHED', deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: productWithColorsInclude,
  })
}

/**
 * Searches the published storefront catalog (beds, mattresses) by name and
 * description. FABRICS-category rows are the fabric-sample catalog (kept
 * DRAFT — see lib/fabrics.ts) and are deliberately excluded here.
 */
export function searchProducts(query: string) {
  const term = query.trim()
  if (!term) return Promise.resolve([])

  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { shortDescription: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: productWithColorsInclude,
  })
}


export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, deletedAt: null },
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
    where: { slug: { in: uniqueSlugs }, deletedAt: null },
    include: productWithColorsInclude,
  })
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is NonNullable<typeof product> => product !== undefined)
}

type ProductWithImages = Awaited<ReturnType<typeof getFeaturedProducts>>[number]

const categoryToDisplay: Record<Category, ProductCategory> = {
  BEDS: 'bed',
  FABRICS: 'fabric',
  MATTRESSES: 'mattress',
}

/**
 * Adapts a DB product into the shape the UI components expect. Size and
 * basePrice fields are included so listing/detail pages can show prices.
 * Each size's price is resolved once, here, via the shared pricing formula
 * (lib/pricing.ts) — components must never recompute it.
 */
export function toDisplayProduct(product: ProductWithImages): DisplayProduct {
  const productImages = product.images
  const mainImage = productImages.find((image) => image.isMain) ?? productImages[0]
  const images = mainImage
    ? [mainImage, ...productImages.filter((image) => image !== mainImage)]
    : productImages

  const variants = (product as any).sizes?.map((s: any) => ({
    id: s.id,
    productId: product.id,
    sku: s.sku ?? '',
    size: s.label,
    price: finalPrice(product as any, s).toNumber(),
    inStock: s.isAvailable,
  })) ?? []

  const addons = (product as any).addons?.map((a: any) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    price: Number(a.price),
    isRequired: a.isRequired,
    options: a.options.map((o: any) => ({
      id: o.id,
      label: o.label,
      priceModifier: Number(o.priceModifier),
    })),
  })) ?? []

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: categoryToDisplay[product.category],
    description: (product as any).description ?? '',
    images: images.map((image) => getImageUrl(image.path)),
    variants,
    addons,
    basePrice: Number((product as any).basePrice ?? 0),
    hasStorage: Boolean((product as any).hasStorage),
    hasDrawer: Boolean((product as any).hasDrawer),
    isNew: Boolean((product as any).isNew),
    createdAt: product.createdAt.toISOString(),
  }
}
