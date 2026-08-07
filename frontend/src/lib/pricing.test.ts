import { describe, expect, it } from 'vitest'
import { Prisma } from '../../../generated/prisma/client'
import { finalPrice, isSaleActive, listPrice } from './pricing'

const decimal = (value: string) => new Prisma.Decimal(value)

function product(overrides: Partial<Parameters<typeof listPrice>[0]> = {}) {
  return {
    basePrice: decimal('500.00'),
    onSale: false,
    salePrice: null,
    saleStartsAt: null,
    saleEndsAt: null,
    ...overrides,
  }
}

function size(overrides: Partial<Parameters<typeof listPrice>[1]> = {}) {
  return {
    priceModifier: decimal('0.00'),
    priceOverride: null,
    ...overrides,
  }
}

describe('listPrice', () => {
  it('uses basePrice + priceModifier when there is no override', () => {
    const p = product({ basePrice: decimal('430.00') })
    const s = size({ priceModifier: decimal('50.00') })
    expect(listPrice(p, s).toFixed(2)).toBe('480.00')
  })

  it('uses priceOverride when set, ignoring the formula entirely', () => {
    const p = product({ basePrice: decimal('430.00') })
    const s = size({ priceModifier: decimal('50.00'), priceOverride: decimal('999.00') })
    expect(listPrice(p, s).toFixed(2)).toBe('999.00')
  })

  it('never produces float drift for classic 0.1 + 0.2-style values', () => {
    const p = product({ basePrice: decimal('0.10') })
    const s = size({ priceModifier: decimal('0.20') })
    expect(listPrice(p, s).toFixed(2)).toBe('0.30')
  })
})

describe('isSaleActive', () => {
  it('is false when onSale is false', () => {
    expect(isSaleActive(product({ onSale: false, salePrice: decimal('1.00') }))).toBe(false)
  })

  it('is false when onSale is true but salePrice is null', () => {
    expect(isSaleActive(product({ onSale: true, salePrice: null }))).toBe(false)
  })

  it('is true when onSale is true, salePrice is set, and there are no date bounds', () => {
    expect(isSaleActive(product({ onSale: true, salePrice: decimal('1.00') }))).toBe(true)
  })

  it('is false before saleStartsAt', () => {
    const p = product({
      onSale: true,
      salePrice: decimal('1.00'),
      saleStartsAt: new Date('2026-06-01'),
    })
    expect(isSaleActive(p, new Date('2026-05-01'))).toBe(false)
  })

  it('is false after saleEndsAt', () => {
    const p = product({
      onSale: true,
      salePrice: decimal('1.00'),
      saleEndsAt: new Date('2026-06-01'),
    })
    expect(isSaleActive(p, new Date('2026-07-01'))).toBe(false)
  })

  it('is true within the [saleStartsAt, saleEndsAt] window', () => {
    const p = product({
      onSale: true,
      salePrice: decimal('1.00'),
      saleStartsAt: new Date('2026-06-01'),
      saleEndsAt: new Date('2026-06-30'),
    })
    expect(isSaleActive(p, new Date('2026-06-15'))).toBe(true)
  })
})

describe('finalPrice', () => {
  it('returns the sale price when the sale is active, regardless of size', () => {
    const p = product({ basePrice: decimal('500.00'), onSale: true, salePrice: decimal('399.00') })
    const s = size({ priceModifier: decimal('50.00') })
    expect(finalPrice(p, s).toFixed(2)).toBe('399.00')
  })

  it('falls back to listPrice when the sale is not active', () => {
    const p = product({ basePrice: decimal('500.00'), onSale: false, salePrice: decimal('399.00') })
    const s = size({ priceModifier: decimal('50.00') })
    expect(finalPrice(p, s).toFixed(2)).toBe('550.00')
  })
})
