import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getStripeClient } from '@/lib/stripe'
import { processStripeEvent, type OrderDelegate, type StripeWebhookEventDelegate } from '@/lib/stripe-webhook'

/**
 * Stripe needs the exact raw bytes of the body to verify the signature —
 * reading `request.text()` (never `.json()`) before verification is what
 * keeps this correct. Next.js App Router route handlers don't parse the
 * body automatically (that's a Pages Router API-routes concern), so no
 * `bodyParser: false` config is needed here.
 */
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set; refusing to process webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    const stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // The order update and the StripeWebhookEvent insert MUST commit together —
  // see processStripeEvent's doc comment for why.
  //
  // maxWait/timeout are raised above Prisma's defaults (2s / 5s) because
  // Neon's pooled connection string can take longer than that to hand out a
  // connection after a burst of near-simultaneous requests (e.g. several
  // `stripe trigger` events landing within the same second) or a cold start —
  // Prisma's default maxWait was getting exceeded before the transaction
  // even began (P2028), not because any individual query was slow.
  const result = await prisma.$transaction(
    async (tx) => {
      const order: OrderDelegate = {
        findFirst: (args) => tx.order.findFirst(args),
        update: (args) => tx.order.update(args),
      }
      const webhookEvent: StripeWebhookEventDelegate = {
        findUnique: (args) => tx.stripeWebhookEvent.findUnique(args),
        create: (args) => tx.stripeWebhookEvent.create({ data: args.data }),
      }
      return processStripeEvent({ order, webhookEvent }, event)
    },
    { maxWait: 10_000, timeout: 20_000 },
  )

  if (result.outcome === 'order_not_found') {
    console.error(`Stripe webhook ${event.id} (${event.type}): no order matched metadata.orderId`)
  } else if (result.outcome === 'unhandled') {
    console.log(`Stripe webhook ${event.id}: unhandled event type ${event.type}`)
  }

  // Always 200 once signature verification passes and the event is recorded —
  // a non-200 makes Stripe retry, which would just re-hit the same dedupe path.
  return NextResponse.json({ received: true, outcome: result.outcome })
}
