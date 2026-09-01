import { describe, expect, it } from 'vitest'
import { Prisma } from '../../generated/prisma/client'
import { toStripeAmount } from './stripe'

const decimal = (value: string) => new Prisma.Decimal(value)

describe('toStripeAmount', () => {
  it('converts whole pounds to pence', () => {
    expect(toStripeAmount(decimal('1800.00'))).toBe(180000)
  })

  it('converts pence-precision values exactly', () => {
    expect(toStripeAmount(decimal('19.99'))).toBe(1999)
  })

  it('never produces float drift for classic 0.1 + 0.2-style sums', () => {
    const sum = decimal('0.10').plus(decimal('0.20'))
    expect(toStripeAmount(sum)).toBe(30)
  })

  it('handles zero', () => {
    expect(toStripeAmount(decimal('0.00'))).toBe(0)
  })

  it('rounds half up for sub-penny remainders', () => {
    expect(toStripeAmount(decimal('19.995'))).toBe(2000)
    expect(toStripeAmount(decimal('19.994'))).toBe(1999)
  })

  it('handles large multi-item totals without drift', () => {
    // 3 x £599.99 + £49.99 shipping, computed entirely in Decimal.
    const lineTotal = decimal('599.99').times(3)
    const total = lineTotal.plus(decimal('49.99'))
    expect(toStripeAmount(total)).toBe(184996)
  })
})
