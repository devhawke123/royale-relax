import { prisma } from '@/lib/prisma'
import { getImageUrl } from '@/lib/media'
import { Prisma } from '../../../generated/prisma/client'

const HISTORY_LIMIT = 20
const SEARCH_LIMIT = 8

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  sizes: { orderBy: { sortOrder: 'asc' as const } },
}

type ProductWithMedia = Prisma.ProductGetPayload<{ include: typeof productInclude }>

export interface ProductSummary {
  id: string
  slug: string
  name: string
  sku: string | null
  image: string | null
  basePrice: number
}

export interface BedOfTheWeekEntrySummary {
  id: string
  discountPercentage: number
  validFrom: string
  validUntil: string
  product: ProductSummary
}

function toProductSummary(product: ProductWithMedia): ProductSummary {
  const mainImage = product.images.find((image) => image.isMain) ?? product.images[0]
  const sku = product.sizes.find((size) => size.sku)?.sku ?? null
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku,
    image: mainImage ? getImageUrl(mainImage.path) : null,
    basePrice: Number(product.basePrice),
  }
}

const entryInclude = { product: { include: productInclude } }
type EntryWithProduct = Prisma.BedOfTheWeekGetPayload<{ include: typeof entryInclude }>

function toEntrySummary(entry: EntryWithProduct): BedOfTheWeekEntrySummary {
  return {
    id: entry.id,
    discountPercentage: Number(entry.discountPercentage),
    validFrom: entry.validFrom.toISOString(),
    validUntil: entry.validUntil.toISOString(),
    product: toProductSummary(entry.product),
  }
}

/** The row the admin panel treats as "current" — flips only when a new one is created, never on a timer. */
export async function getAdminCurrentBedOfTheWeek(): Promise<BedOfTheWeekEntrySummary | null> {
  const entry = await prisma.bedOfTheWeek.findFirst({
    where: { isActive: true },
    include: entryInclude,
  })
  return entry ? toEntrySummary(entry) : null
}

export async function getBedOfTheWeekHistory(limit = HISTORY_LIMIT): Promise<BedOfTheWeekEntrySummary[]> {
  const rows = await prisma.bedOfTheWeek.findMany({
    where: { isActive: false },
    orderBy: { validFrom: 'desc' },
    take: limit,
    include: entryInclude,
  })
  return rows.map(toEntrySummary)
}

export interface StorefrontBedOfTheWeek {
  product: ProductSummary
  discountPercentage: number
  validUntil: string
  /** false once validUntil has passed — the product still shows, just without the promo price/badge. */
  isPromotionLive: boolean
}

/**
 * Storefront read. Explicit fallback: once *any* Bed of the Week has ever
 * been set, the homepage always has something to show — if the active entry
 * has expired (or somehow none is marked active) it falls back to the most
 * recently created entry and renders it undiscounted. The section is hidden
 * only when no Bed of the Week has ever been configured at all.
 */
export async function getStorefrontBedOfTheWeek(): Promise<StorefrontBedOfTheWeek | null> {
  const now = new Date()

  const active = await prisma.bedOfTheWeek.findFirst({
    where: { isActive: true },
    include: entryInclude,
  })
  const entry =
    active ??
    (await prisma.bedOfTheWeek.findFirst({
      orderBy: { validFrom: 'desc' },
      include: entryInclude,
    }))

  if (!entry || entry.product.deletedAt) return null

  const isPromotionLive = entry.isActive && entry.validUntil >= now

  return {
    product: toProductSummary(entry.product),
    discountPercentage: isPromotionLive ? Number(entry.discountPercentage) : 0,
    validUntil: entry.validUntil.toISOString(),
    isPromotionLive,
  }
}

export async function searchBedProducts(query: string, limit = SEARCH_LIMIT): Promise<ProductSummary[]> {
  const term = query.trim()
  if (!term) return []

  const products = await prisma.product.findMany({
    where: {
      category: 'BEDS',
      status: 'PUBLISHED',
      deletedAt: null,
      OR: [
        { name: { contains: term } },
        { slug: { contains: term } },
        { sizes: { some: { sku: { contains: term } } } },
      ],
    },
    take: limit,
    orderBy: { name: 'asc' },
    include: productInclude,
  })

  return products.map(toProductSummary)
}

export class BedOfTheWeekValidationError extends Error {}

export function assertValidDiscountPercentage(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new BedOfTheWeekValidationError('discountPercentage must be a number')
  }
  if (value < 0 || value > 100) {
    throw new BedOfTheWeekValidationError('discountPercentage must be between 0 and 100')
  }
  return value
}

export function assertValidValidUntil(value: unknown): Date {
  if (typeof value !== 'string' || !value) {
    throw new BedOfTheWeekValidationError('validUntil is required')
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new BedOfTheWeekValidationError('validUntil must be a valid date')
  }
  if (date.getTime() <= Date.now()) {
    throw new BedOfTheWeekValidationError('validUntil must be a future date')
  }
  return date
}

/**
 * Creates the new active entry and archives whichever entry was active
 * before it. If the outgoing entry was still scheduled to run past now, its
 * validUntil is capped to the replacement moment so the history list shows
 * when it actually stopped running, not when it was originally due to.
 */
export async function setBedOfTheWeek(input: {
  productId: string
  discountPercentage: number
  validUntil: Date
}): Promise<BedOfTheWeekEntrySummary> {
  const product = await prisma.product.findUnique({ where: { id: input.productId } })
  if (!product) {
    throw new BedOfTheWeekValidationError('Product not found')
  }

  const now = new Date()

  const created = await prisma.$transaction(async (tx) => {
    const currentActive = await tx.bedOfTheWeek.findFirst({ where: { isActive: true } })
    if (currentActive) {
      await tx.bedOfTheWeek.update({
        where: { id: currentActive.id },
        data: {
          isActive: false,
          validUntil: currentActive.validUntil > now ? now : currentActive.validUntil,
        },
      })
    }

    return tx.bedOfTheWeek.create({
      data: {
        productId: input.productId,
        discountPercentage: input.discountPercentage,
        validFrom: now,
        validUntil: input.validUntil,
        isActive: true,
      },
      include: entryInclude,
    })
  })

  return toEntrySummary(created)
}

export async function updateActiveBedOfTheWeekDiscount(
  discountPercentage: number,
): Promise<BedOfTheWeekEntrySummary> {
  const active = await prisma.bedOfTheWeek.findFirst({ where: { isActive: true } })
  if (!active) {
    throw new BedOfTheWeekValidationError('No active Bed of the Week to update')
  }

  const updated = await prisma.bedOfTheWeek.update({
    where: { id: active.id },
    data: { discountPercentage },
    include: entryInclude,
  })

  return toEntrySummary(updated)
}
