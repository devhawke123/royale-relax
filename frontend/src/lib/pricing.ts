import { Prisma } from '../../generated/prisma/client'

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

/**
 * Same basePrice + priceModifier (or priceOverride) formula as listPrice,
 * but with salePrice standing in for basePrice while a sale is active — a
 * size's modifier must still apply on top of the sale, otherwise every size
 * of an on-sale product prices identically at the flat salePrice.
 */
export function finalPrice(product: PricedProduct, size: PricedSize, now: Date = new Date()): Prisma.Decimal {
  if (size.priceOverride !== null) return size.priceOverride
  if (isSaleActive(product, now)) {
    return (product.salePrice as Prisma.Decimal).plus(size.priceModifier)
  }
  return product.basePrice.plus(size.priceModifier)
}
