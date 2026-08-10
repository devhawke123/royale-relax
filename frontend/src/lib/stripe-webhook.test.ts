import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import { processStripeEvent, type OrderDelegate, type StripeWebhookEventDelegate } from './stripe-webhook'

interface FakeOrder {
  id: string
  status: string
  paymentStatus: string
  paidAt: Date | null
  stripePaymentIntentId: string | null
}

function createFakeDeps(orders: FakeOrder[] = []) {
  const orderMap = new Map(orders.map((o) => [o.id, o]))
  const events = new Map<string, { id: string; type: string }>()

  const order: OrderDelegate = {
    async findFirst({ where }) {
      return orderMap.get(where.id) ?? null
    },
    async update({ where, data }) {
      const existing = orderMap.get(where.id)
      if (!existing) throw new Error('not found')
      const updated = { ...existing, ...data } as FakeOrder
      orderMap.set(where.id, updated)
      return updated
    },
  }

  const webhookEvent: StripeWebhookEventDelegate = {
    async findUnique({ where }) {
      return events.get(where.id) ?? null
    },
    async create({ data }) {
      events.set(data.id, data)
      return data
    },
  }

  return { deps: { order, webhookEvent }, orderMap, events }
}

function completedSessionEvent(eventId: string, orderId: string | undefined, paymentIntentId = 'pi_123'): Stripe.Event {
  return {
    id: eventId,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        metadata: orderId ? { orderId } : {},
        payment_intent: paymentIntentId,
      },
    },
  } as unknown as Stripe.Event
}

function expiredSessionEvent(eventId: string, orderId: string): Stripe.Event {
  return {
    id: eventId,
    type: 'checkout.session.expired',
    data: {
      object: {
        id: 'cs_test_456',
        metadata: { orderId },
      },
    },
  } as unknown as Stripe.Event
}

describe('processStripeEvent', () => {
  it('checkout.session.completed marks the order PAID with paidAt + payment intent', async () => {
    const { deps, orderMap } = createFakeDeps([
      { id: 'order-1', status: 'PENDING', paymentStatus: 'UNPAID', paidAt: null, stripePaymentIntentId: null },
    ])

    const result = await processStripeEvent(deps, completedSessionEvent('evt_1', 'order-1', 'pi_abc'))

    expect(result).toEqual({ outcome: 'handled', type: 'checkout.session.completed' })
    const order = orderMap.get('order-1')!
    expect(order.paymentStatus).toBe('PAID')
    expect(order.status).toBe('PAID')
    expect(order.paidAt).toBeInstanceOf(Date)
    expect(order.stripePaymentIntentId).toBe('pi_abc')
  })

  it('checkout.session.expired marks the order CANCELLED, leaves paymentStatus UNPAID', async () => {
    const { deps, orderMap } = createFakeDeps([
      { id: 'order-2', status: 'PENDING', paymentStatus: 'UNPAID', paidAt: null, stripePaymentIntentId: null },
    ])

    const result = await processStripeEvent(deps, expiredSessionEvent('evt_2', 'order-2'))

    expect(result).toEqual({ outcome: 'handled', type: 'checkout.session.expired' })
    const order = orderMap.get('order-2')!
    expect(order.status).toBe('CANCELLED')
    expect(order.paymentStatus).toBe('UNPAID')
  })

  it('IDEMPOTENCY: the same event id processed twice only mutates the order once', async () => {
    const { deps, orderMap, events } = createFakeDeps([
      { id: 'order-3', status: 'PENDING', paymentStatus: 'UNPAID', paidAt: null, stripePaymentIntentId: null },
    ])

    const first = await processStripeEvent(deps, completedSessionEvent('evt_dup', 'order-3', 'pi_first'))
    expect(first.outcome).toBe('handled')
    const paidAtAfterFirst = orderMap.get('order-3')!.paidAt

    // Stripe retries the same event id (e.g. because our endpoint was slow to 200 last time).
    const second = await processStripeEvent(deps, completedSessionEvent('evt_dup', 'order-3', 'pi_first'))
    expect(second).toEqual({ outcome: 'duplicate' })

    // Not reprocessed: paidAt identical, still exactly one StripeWebhookEvent row for evt_dup.
    expect(orderMap.get('order-3')!.paidAt).toBe(paidAtAfterFirst)
    expect(events.has('evt_dup')).toBe(true)
  })

  it('records the event even for a type it does not act on, and reports it unhandled', async () => {
    const { deps, events } = createFakeDeps()
    const event = { id: 'evt_other', type: 'payment_intent.created', data: { object: {} } } as unknown as Stripe.Event

    const result = await processStripeEvent(deps, event)

    expect(result).toEqual({ outcome: 'unhandled', type: 'payment_intent.created' })
    expect(events.has('evt_other')).toBe(true)
  })

  it('reports order_not_found (and still records the event) when metadata.orderId does not resolve', async () => {
    const { deps, events } = createFakeDeps([])

    const result = await processStripeEvent(deps, completedSessionEvent('evt_missing', 'does-not-exist'))

    expect(result).toEqual({ outcome: 'order_not_found', type: 'checkout.session.completed' })
    expect(events.has('evt_missing')).toBe(true)
  })
})
