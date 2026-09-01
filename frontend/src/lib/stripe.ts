import Stripe from 'stripe'
import { Prisma } from '../../generated/prisma/client'

let cachedClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  cachedClient = new Stripe(key)
  return cachedClient
}

/**
 * Stripe wants integer minor units ("pence" for GBP), not decimal currency.
 * Goes through Decimal the whole way — no float multiplication — and rounds
 * half-up on the rare input with more than 2 decimal places.
 */
export function toStripeAmount(amount: Prisma.Decimal): number {
  return amount.times(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toNumber()
}
