import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import {
  getAdminCurrentBedOfTheWeek,
  getBedOfTheWeekHistory,
  setBedOfTheWeek,
  assertValidDiscountPercentage,
  assertValidValidUntil,
  BedOfTheWeekValidationError,
} from '@/lib/bed-of-the-week'

export async function GET(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const [current, history] = await Promise.all([getAdminCurrentBedOfTheWeek(), getBedOfTheWeekHistory()])

  return NextResponse.json({ current, history })
}

export async function POST(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { productId, discountPercentage, validUntil } = (body ?? {}) as Record<string, unknown>

  if (typeof productId !== 'string' || !productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  try {
    const discount = assertValidDiscountPercentage(discountPercentage)
    const validUntilDate = assertValidValidUntil(validUntil)

    await setBedOfTheWeek({ productId, discountPercentage: discount, validUntil: validUntilDate })
  } catch (err) {
    if (err instanceof BedOfTheWeekValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    throw err
  }

  const [current, history] = await Promise.all([getAdminCurrentBedOfTheWeek(), getBedOfTheWeekHistory()])

  return NextResponse.json({ current, history })
}
