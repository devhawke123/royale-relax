import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOrderFromCart, CheckoutError, type Cart, type BillingDetails } from '@/lib/checkout'
import { getStripeClient, toStripeAmount } from '@/lib/stripe'
import { getAccessTokenClaims, AuthError } from '@/lib/auth/require-auth'

function getSiteUrl(request: Request): string {
  const configured = process.env.SITE_URL
  if (configured) return configured.replace(/\/$/, '')
  const origin = request.headers.get('origin')
  if (origin) return origin
  return 'http://localhost:3000'
}

/**
 * Works identically for guests and logged-in customers. If a valid access
 * token is present, the order is linked to that customer; if it's absent,
 * invalid, or expired, we silently fall back to a guest order (customerId
 * null) rather than rejecting the request — auth is optional here, not
 * required.
 */
function resolveCustomerId(request: Request): string | null {
  try {
    const claims = getAccessTokenClaims(request)
    return claims.subject === 'customer' ? claims.sub : null
  } catch (err) {
    if (err instanceof AuthError) return null
    throw err
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cart, billing } = (body ?? {}) as { cart?: Cart; billing?: BillingDetails }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart is required and must contain at least one item' }, { status: 400 })
  }

  const requiredBillingFields: (keyof BillingDetails)[] = [
    'firstName',
    'lastName',
    'country',
    'address',
    'city',
    'county',
    'postcode',
    'phone',
    'email',
  ]
  for (const field of requiredBillingFields) {
    if (!billing || typeof billing[field] !== 'string' || !(billing[field] as string).trim()) {
      return NextResponse.json({ error: `Billing field "${field}" is required` }, { status: 400 })
    }
  }

  const customerId = resolveCustomerId(request)

  let order
  try {
    order = await createOrderFromCart(cart, billing as BillingDetails, customerId)
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const siteUrl = getSiteUrl(request)

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'gbp',
      product_data: {
        name: [item.productName, item.sizeLabel, item.fabricName].filter(Boolean).join(' — '),
      },
      unit_amount: toStripeAmount(item.lineTotal),
    },
    quantity: 1, // lineTotal already accounts for this item's quantity + addons
  }))

  if (order.shippingFee.greaterThan(0)) {
    lineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: { name: 'Shipping' },
        unit_amount: toStripeAmount(order.shippingFee),
      },
      quantity: 1,
    })
  }

  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: order.email,
      success_url: `${siteUrl}/cart/success?order=${order.orderNumber}`,
      cancel_url: `${siteUrl}/checkout?cancelled=1`,
      metadata: { orderId: order.id },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    })

    return NextResponse.json({
      url: session.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (err) {
    // The order stays PENDING/UNPAID with no session id — the customer can
    // retry checkout for the same cart. We do not delete the order: it's
    // useful abandonment signal and nothing was ever charged.
    console.error('Stripe checkout session creation failed', err)
    return NextResponse.json({ error: 'Unable to start payment. Please try again.' }, { status: 502 })
  }
}
