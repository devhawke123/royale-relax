import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import {
  updateActiveBedOfTheWeekDiscount,
  assertValidDiscountPercentage,
  BedOfTheWeekValidationError,
} from '@/lib/bed-of-the-week'

export async function PATCH(request: Request) {
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

  const { discountPercentage } = (body ?? {}) as Record<string, unknown>

  try {
    const discount = assertValidDiscountPercentage(discountPercentage)
    const current = await updateActiveBedOfTheWeekDiscount(discount)
    return NextResponse.json({ current })
  } catch (err) {
    if (err instanceof BedOfTheWeekValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    throw err
  }
}
