'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, type InputHTMLAttributes, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { formatPrice, VisaBadge, MastercardBadge } from '@/components/ProductDetailPage/shared'

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 7 12" fill="none" className="h-3 w-[7px]">
      <path
        d="M6.72168 6.66656L1.34415 12L0 10.6669L4.70546 6L0 1.33312L1.34415 0L6.72168 5.33344L6.72168 6.66656Z"
        fill="currentColor"
        transform="rotate(180 3.36 6)"
      />
    </svg>
  )
}

function BackToCartLink() {
  return (
    <Link
      href="/cart"
      className="flex items-center gap-2 text-[14px] font-medium text-black transition-colors hover:text-[#b87333]"
    >
      <ChevronLeftIcon />
      Back to cart
    </Link>
  )
}

function BillingField({
  label,
  required,
  className = '',
  ...props
}: { label: string; required?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2 text-[15px] text-[#6a6d70]">
      <span>
        {label} {required && <span className="text-[#de3618]">*</span>}
      </span>
      <input
        required={required}
        className={`h-[52px] w-full rounded-[10px] border border-[#71717a] bg-white px-4 text-[15px] text-black outline-none focus:border-[#b87333] ${className}`}
        {...props}
      />
    </label>
  )
}

function EmptyCheckout() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <p className="text-[16px] font-medium text-black">Your cart is empty — add something before checking out.</p>
      <Link
        href="/"
        className="flex h-12 w-[200px] items-center justify-center rounded-[5px] bg-[#b87333] text-[16px] font-medium text-white transition-colors hover:bg-[#9c5f28]"
      >
        Lets shop
      </Link>
    </div>
  )
}

export function CheckoutPageClient() {
  const { cartItems, subtotal, clearCart } = useCart()
  const isEmpty = cartItems.length === 0

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [deliverToDifferentAddress, setDeliverToDifferentAddress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  async function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCheckoutError(null)

    const formData = new FormData(event.currentTarget)
    const field = (name: string) => (formData.get(name) as string | null)?.trim() || undefined

    const billing = {
      firstName: field('firstName') ?? '',
      lastName: field('lastName') ?? '',
      companyName: field('companyName'),
      country: field('country') ?? '',
      address: field('address') ?? '',
      city: field('city') ?? '',
      county: field('county') ?? '',
      postcode: field('postcode') ?? '',
      phone: field('phone') ?? '',
      email: field('email') ?? '',
      deliverToDifferentAddress,
      orderNotes: field('orderNotes'),
    }

    const cart = {
      items: cartItems.map((line) => ({
        productId: line.productId,
        sizeId: line.sizeId,
        fabricColorId: line.fabricColorId,
        quantity: line.quantity,
      })),
    }

    setIsSubmitting(true)
    try {
      const accessToken = typeof window !== 'undefined' ? window.localStorage.getItem('rr_access_token') : null
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ cart, billing }),
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        setCheckoutError(data.error ?? 'Something went wrong starting checkout. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Order is created; hand off to Stripe's hosted page for card entry.
      // Cart clears now — the order already exists server-side regardless
      // of whether payment completes, so there's nothing left to "keep".
      clearCart()
      window.location.href = data.url
    } catch {
      setCheckoutError('Could not reach the server. Please check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-6">
          <h1 className="text-[36px] font-medium text-black capitalize">Checkout</h1>
          <BackToCartLink />
        </div>

        {isEmpty ? (
          <EmptyCheckout />
        ) : (
          <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Order summary */}
            <div className="flex flex-col gap-6 rounded-[10px] bg-[#f9f9f9] p-6 sm:p-8">
              <h2 className="text-[28px] font-medium text-black">Your order</h2>

              <div className="flex flex-col gap-6 rounded-[8px] bg-white p-6">
                <div className="flex items-center justify-between text-[18px] font-medium text-black">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>

                <div className="flex flex-col divide-y divide-stone-100">
                  {cartItems.map((line) => (
                    <div key={line.id} className="flex flex-col gap-2 py-4 first:pt-0">
                      <div className="flex items-start gap-4">
                        <div className="relative h-[54px] w-[48px] shrink-0 overflow-hidden rounded-[6px] bg-[#e8e4e0]">
                          {line.image && (
                            <Image src={line.image} alt={line.name} fill sizes="48px" className="object-cover" />
                          )}
                        </div>
                        <div className="flex flex-1 items-start justify-between gap-4">
                          <span className="text-[16px] text-[#6a6d70] capitalize">
                            {line.name}
                            {line.quantity > 1 && <span className="text-black"> × {line.quantity}</span>}
                          </span>
                          <span className="shrink-0 text-[16px] text-black">
                            {formatPrice(line.price * line.quantity)}
                          </span>
                        </div>
                      </div>
                      {line.options && line.options.length > 0 && (
                        <div className="flex flex-col gap-1 pl-[64px]">
                          {line.options.map((option) => (
                            <p key={option.label} className="text-[14px] leading-[22px]">
                              <span className="text-black">{option.label}: </span>
                              <span className="text-[#6a6d70]">{option.value}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-start justify-between border-t border-stone-100 pt-4 text-[16px]">
                  <span className="font-medium text-black">Shipping</span>
                  <span className="max-w-[280px] text-right text-[14px] leading-[22px] text-[#6a6d70]">
                    Free delivery within 5 to 10 working days (unless delayed by customer choice) — Rapid Orders
                    delivered within 3 to 5 working days.
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-[18px]">
                  <span className="font-bold text-black">Total</span>
                  <span className="font-bold text-black">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[8px] bg-white p-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-[16px] font-medium text-black">
                    <input type="radio" name="payment-method" defaultChecked className="h-[18px] w-[18px] accent-[#b87333]" />
                    Debit/Credit Card
                  </label>
                  <span className="text-[16px] text-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <VisaBadge />
                  <MastercardBadge />
                </div>
              </div>

              <label className="flex items-start gap-3 text-[14px] leading-[22px] text-black">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-[17px] w-[17px] shrink-0 accent-black"
                />
                I have read and agree to the website terms and conditions and I have reviewed my order carefully. *
              </label>

              {checkoutError && (
                <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-700">{checkoutError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-[56px] w-full items-center justify-center rounded-[5px] bg-[#9d6026] text-[18px] font-bold text-white transition-colors hover:bg-[#84501f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Redirecting to payment…' : 'Place Order'}
              </button>
            </div>

            {/* Billing details */}
            <div className="flex flex-col gap-6 rounded-[10px] bg-[#f9f9f9] p-6 sm:p-8">
              <h2 className="text-[28px] font-medium text-black">Billing details</h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <BillingField label="First name" name="firstName" required />
                <BillingField label="Last name" name="lastName" required />
              </div>

              <BillingField label="Company name (optional)" name="companyName" />
              <BillingField label="Country/Region" name="country" required />
              <BillingField label="Street address" name="address" required />
              <BillingField label="Town / City" name="city" required />
              <BillingField label="County (optional)" name="county" />
              <BillingField label="Postcode" name="postcode" required />
              <BillingField label="Phone" name="phone" type="tel" required />
              <BillingField label="Email address" name="email" type="email" required />

              <label className="flex items-center gap-3 text-[15px] text-black">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="h-[17px] w-[17px] accent-black"
                />
                Create an account?
              </label>

              <label className="flex items-center gap-3 text-[15px] text-black">
                <input
                  type="checkbox"
                  checked={deliverToDifferentAddress}
                  onChange={(e) => setDeliverToDifferentAddress(e.target.checked)}
                  className="h-[17px] w-[17px] accent-black"
                />
                Deliver to a different address? (This option might not work if you choose Dividebuy Finance as a
                payment option.)
              </label>

              <label className="flex flex-col gap-2 text-[15px] text-[#6a6d70]">
                <span>Order notes (optional)</span>
                <textarea
                  name="orderNotes"
                  rows={6}
                  className="w-full resize-none rounded-[10px] border border-[#71717a] bg-white px-4 py-3 text-[15px] text-black outline-none focus:border-[#b87333]"
                />
              </label>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
