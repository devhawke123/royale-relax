import { describe, expect, it } from 'vitest'
import Stripe from 'stripe'

// Webhook signature verification is pure local HMAC — it needs the webhook
// signing secret, not a real API key or network access, so this is fully
// testable offline. `apiKey` here is a dummy: it's only used if the client
// makes an actual API call, which constructEvent never does.
const stripe = new Stripe('sk_test_dummy_key_for_offline_signature_tests')
const WEBHOOK_SECRET = 'whsec_test_secret_for_unit_tests'

describe('Stripe webhook signature verification', () => {
  it('accepts a payload with a valid signature', () => {
    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' })
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET })

    const event = stripe.webhooks.constructEvent(payload, header, WEBHOOK_SECRET)
    expect(event.id).toBe('evt_1')
  })

  it('REJECTS a payload that was tampered with after signing', () => {
    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' })
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET })

    // Attacker (or a proxy/CDN) mutates the body after the signature was computed.
    const tamperedPayload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', amount: 1 })

    expect(() => stripe.webhooks.constructEvent(tamperedPayload, header, WEBHOOK_SECRET)).toThrow()
  })

  it('REJECTS a valid signature computed with the wrong secret', () => {
    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' })
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_wrong_secret' })

    expect(() => stripe.webhooks.constructEvent(payload, header, WEBHOOK_SECRET)).toThrow()
  })

  it('rejects a missing signature header', () => {
    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' })
    expect(() => stripe.webhooks.constructEvent(payload, '', WEBHOOK_SECRET)).toThrow()
  })
})
