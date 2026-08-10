import type Stripe from 'stripe'

export interface OrderRecord {
  id: string
  status: string
}

/**
 * The subset of Prisma delegates this module needs, scoped to what must be
 * touched inside the SAME transaction as the StripeWebhookEvent insert.
 */
export interface OrderDelegate {
  findFirst(args: { where: { id: string } }): Promise<OrderRecord | null>
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>
}

export interface StripeWebhookEventDelegate {
  findUnique(args: { where: { id: string } }): Promise<{ id: string } | null>
  create(args: { data: { id: string; type: string } }): Promise<unknown>
}

export interface StripeWebhookDeps {
  order: OrderDelegate
  webhookEvent: StripeWebhookEventDelegate
}

export type ProcessResult =
  | { outcome: 'duplicate' }
  | { outcome: 'handled'; type: string }
  | { outcome: 'unhandled'; type: string }
  | { outcome: 'order_not_found'; type: string }

/**
 * Processes one Stripe event idempotently. Callers MUST invoke this inside a
 * single `prisma.$transaction`, passing delegates bound to the transaction
 * client: the order mutation and the StripeWebhookEvent insert have to
 * commit together, or a crash between the two would let a retried webhook
 * reprocess (or, worse, a processed event never get recorded and never be
 * retried). This function itself never throws for an expected outcome —
 * every branch returns a result and falls through to recording the event —
 * see refresh.ts's RotateResult for the same "don't throw out of a
 * transaction for expected outcomes" reasoning.
 */
export async function processStripeEvent(deps: StripeWebhookDeps, event: Stripe.Event): Promise<ProcessResult> {
  const already = await deps.webhookEvent.findUnique({ where: { id: event.id } })
  if (already) {
    return { outcome: 'duplicate' }
  }

  let handled = false
  let orderNotFound = false

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const order = await findOrderFromSession(deps, session)
    if (order) {
      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? null)
      await deps.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'PAID',
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntentId,
        },
      })
      handled = true
    } else {
      orderNotFound = true
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const order = await findOrderFromSession(deps, session)
    if (order) {
      // The session that was created for this order died unused. Rather than
      // leaving it PENDING forever (which would make it indistinguishable
      // from an order still awaiting payment), mark it CANCELLED. paymentStatus
      // stays UNPAID — nothing was ever charged. A customer who wants to try
      // again goes through /api/checkout again, which creates a fresh order.
      await deps.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      })
      handled = true
    } else {
      orderNotFound = true
    }
  }

  await deps.webhookEvent.create({ data: { id: event.id, type: event.type } })

  if (orderNotFound) return { outcome: 'order_not_found', type: event.type }
  return handled ? { outcome: 'handled', type: event.type } : { outcome: 'unhandled', type: event.type }
}

async function findOrderFromSession(
  deps: StripeWebhookDeps,
  session: Stripe.Checkout.Session,
): Promise<OrderRecord | null> {
  const orderId = session.metadata?.orderId
  if (!orderId) return null
  return deps.order.findFirst({ where: { id: orderId } })
}
