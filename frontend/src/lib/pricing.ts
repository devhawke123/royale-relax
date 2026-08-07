import { Prisma } from '../../../generated/prisma/client'

type PricedProduct = {
  basePrice: Prisma.Decimal
  onSale: boolean
  salePrice: Prisma.Decimal | null
  saleStartsAt: Date | null
  saleEndsAt: Date | null
}

type PricedSize = {
  priceModifier: Prisma.Decimal
  priceOverride: Prisma.Decimal | null
}

/**
 * The single source of truth for what a size costs. priceOverride exists
 * only to break the basePrice + priceModifier formula outright — leave it
 * null and the formula stays in charge.
 */
export function listPrice(product: PricedProduct, size: PricedSize): Prisma.Decimal {
  return size.priceOverride ?? product.basePrice.plus(size.priceModifier)
}

/**
 * onSale is an evergreen flag; saleStartsAt/saleEndsAt (if set) additionally
 * time-box it. A null bound on either side means that side is unbounded.
 */
export function isSaleActive(product: PricedProduct, now: Date = new Date()): boolean {
  if (!product.onSale || product.salePrice === null) return false
  if (product.saleStartsAt && now < product.saleStartsAt) return false
  if (product.saleEndsAt && now > product.saleEndsAt) return false
  return true
}

export function finalPrice(product: PricedProduct, size: PricedSize, now: Date = new Date()): Prisma.Decimal {
  if (isSaleActive(product, now)) {
    return product.salePrice as Prisma.Decimal
  }
  return listPrice(product, size)
}
