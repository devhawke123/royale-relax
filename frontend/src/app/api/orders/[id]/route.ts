import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccessTokenClaims, AuthError } from '@/lib/auth/require-auth'

/**
 * Order owner or admin, via Bearer token — OR, for guest orders only
 * (customerId null), by presenting the orderNumber + email as a
 * knowledge-based credential in place of a token, e.g. from the
 * checkout-success page which only has the orderNumber from the Stripe
 * success_url.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { addons: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  let claims: ReturnType<typeof getAccessTokenClaims> | null = null
  try {
    claims = getAccessTokenClaims(request)
  } catch (err) {
    if (!(err instanceof AuthError)) throw err
  }

  if (claims) {
    const isOwner = claims.subject === 'customer' && claims.sub === order.customerId
    const isAdmin = claims.subject === 'admin'
    if (isOwner || isAdmin) {
      return NextResponse.json({ order })
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // No (valid) token: only guest orders can be looked up, and only with
  // both the orderNumber and email matching exactly.
  if (order.customerId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const url = new URL(request.url)
  const orderNumber = url.searchParams.get('orderNumber')
  const email = url.searchParams.get('email')

  const matches =
    !!orderNumber &&
    !!email &&
    orderNumber === order.orderNumber &&
    email.trim().toLowerCase() === order.email.toLowerCase()

  if (!matches) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
