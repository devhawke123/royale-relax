'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { formatPrice, QuantityStepper } from '@/components/ProductDetailPage/shared'

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

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
      <path
        d="M5 5L19 19M19 5L5 19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ContinueShoppingLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-[14px] font-medium text-black transition-colors hover:text-[#b87333]"
    >
      <ChevronLeftIcon />
      Continue Shopping
    </Link>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-8 py-24 text-center">
      <div className="flex flex-col items-center gap-6">
        <Image src="/icons/empty-cart-trolley.svg" alt="" width={127} height={127} className="h-24 w-24 sm:h-32 sm:w-32" />
        <p className="flex items-center gap-2 text-[16px] font-medium text-black">
          You dont have any item in your cart right now
          <Image src="/icons/empty-cart-face.svg" alt="" width={20} height={22} className="h-5 w-5" />
        </p>
      </div>
      <Link
        href="/"
        className="flex h-12 w-[200px] items-center justify-center rounded-[5px] bg-[#b87333] text-[16px] font-medium text-white transition-colors hover:bg-[#9c5f28]"
      >
        Lets shop
      </Link>
    </div>
  )
}

function CartTableHeader() {
  return (
    <div className="hidden grid-cols-[3fr_1fr_1fr_1fr] gap-4 rounded-t-[8px] bg-[#f9f9f9] px-6 py-5 text-[16px] capitalize text-[#6a6d70] sm:grid">
      <span>Product</span>
      <span>Price</span>
      <span>Quantity</span>
      <span className="text-right">Total</span>
    </div>
  )
}

export function CartPageClient() {
  const { cartItems, subtotal, removeFromCart, updateQuantity } = useCart()
  const router = useRouter()
  const isEmpty = cartItems.length === 0

  const handleCheckout = () => {
    router.push('/checkout')
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-6">
          <h1 className="text-[36px] font-medium text-black capitalize">My Cart</h1>
          <ContinueShoppingLink />
        </div>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 flex flex-col gap-8">
            <div className="flex flex-col overflow-hidden rounded-[8px] border border-[#6a6d70]/40">
              <CartTableHeader />
              <div className="flex flex-col divide-y divide-[#6a6d70]/20">
                {cartItems.map((line) => (
                  <div
                    key={line.id}
                    className="relative grid grid-cols-1 items-center gap-4 bg-[#f9f9f9] px-6 py-6 pr-14 sm:grid-cols-[3fr_1fr_1fr_1fr] sm:pr-16"
                  >
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.id)}
                      aria-label={`Remove ${line.name} from cart`}
                      className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 sm:top-1/2 sm:right-6 sm:-translate-y-1/2"
                    >
                      <RemoveIcon />
                    </button>

                    <div className="flex items-center gap-4 pr-8">
                      <div className="relative h-[86px] w-[76px] shrink-0 overflow-hidden rounded-[8px] bg-[#e8e4e0]">
                        {line.image && (
                          <Image src={line.image} alt={line.name} fill sizes="76px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] text-[#222] capitalize">{line.name}</span>
                        <span className="text-[13px] text-[#6a6d70]">#{line.id.slice(0, 13)}</span>
                        {line.options && line.options.length > 0 && (
                          <span className="text-[13px] text-[#6a6d70] capitalize">
                            {line.options.map((o) => o.value).join(' // ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[16px] text-black">{formatPrice(line.price)}</span>

                    <QuantityStepper
                      quantity={line.quantity}
                      onChange={(next) => updateQuantity(line.id, next)}
                      className="justify-self-start"
                    />

                    <span className="text-[16px] font-medium text-black sm:text-right">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ml-auto flex w-full max-w-sm flex-col gap-4 border border-stone-100 p-6">
              <div className="flex items-center justify-between text-[16px] text-black">
                <span className="font-bold">Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="flex h-[47px] w-full items-center justify-center rounded-[5px] bg-black text-[16px] font-medium text-white transition-colors hover:bg-black/85"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
