'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/types/product'
import { parseBedDescription } from '@/lib/bed-description'
import { useCart } from '@/lib/cart-context'
import { ProductCard } from '@/components/ui/ProductCard'
import {
  formatPrice,
  ChevronDownIcon,
  OrderOptionSelect,
  extractPriceDelta,
  RatingStars,
  VisaBadge,
  MastercardBadge,
  DeliveryTimeline,
  QuantityStepper,
} from '@/components/ProductDetailPage/shared'

// Every mattress description ends with this measurement disclaimer (see
// prisma/seed-mattress-catalog-details.ts); the Figma design breaks it out
// into its own "Note" callout above the description rather than folding it
// into the closing "Why Choose" paragraph.
const NOTE_SENTENCE = /please note that all measurements are approximate[^.]*\.\s*/i

interface MattressDetailClientProps {
  product: Product
  relatedProducts?: Product[]
}

export function MattressDetailClient({ product, relatedProducts = [] }: MattressDetailClientProps) {
  const { addToCart } = useCart()
  const parsed = useMemo(() => parseBedDescription(product.description ?? ''), [product.description])
  const whyBody = useMemo(() => parsed.whyBody?.replace(NOTE_SENTENCE, '').trim() || parsed.whyBody, [parsed.whyBody])

  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [deliveryDelta, setDeliveryDelta] = useState(0)

  const [activeImage, setActiveImage] = useState(product.images[0])

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0]
  const basePrice = selectedVariant?.price ?? product.basePrice ?? 0
  const price = basePrice + deliveryDelta

  const thumbnails = product.images

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          {/* ── Left column: gallery + rating + description ── */}
          <div className="flex flex-col gap-6">
            {/* Gallery */}
            <div className="flex flex-col gap-3 rounded-[3px] border border-stone-100 bg-white p-2">
              <div className="flex gap-3">
                <div className="flex max-h-[500px] flex-col gap-2 overflow-y-auto">
                  {(thumbnails.length > 0 ? thumbnails : product.images).map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setActiveImage(src)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[2px] border-2 ${
                        activeImage === src ? 'border-[#b87333]' : 'border-transparent'
                      }`}
                    >
                      <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
                <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-[#e8e4e0]">
                  {activeImage ? (
                    <Image src={activeImage} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" priority />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl text-stone-400">🛏</div>
                  )}
                </div>
              </div>
              <RatingStars rating={product.rating ?? 4.9} reviewCount={product.reviewCount ?? 150} />
            </div>

            {/* Note */}
            <p className="text-[15px] text-black">
              <span className="font-bold text-[#b87333]">Note: </span>
              All measurements are approximate and allow for a tolerance of plus or minus 1–2 cm.
            </p>

            {/* Description + Premium Features */}
            <div className="flex flex-col gap-6 border border-stone-100 bg-white p-6">
              <h2 className="text-[22px] font-bold text-[#09090a]">Description</h2>
              {parsed.intro && <p className="whitespace-pre-line text-[16px] leading-relaxed text-black">{parsed.intro}</p>}

              {parsed.features.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[20px] font-bold text-black">Premium Features:</h3>
                  <ul className="flex flex-col gap-2">
                    {parsed.features.map((feature) => (
                      <li key={feature.title} className="flex items-start gap-3 py-1.5 text-[16px] text-black">
                        <span className="mt-2.5 h-[5px] w-[5px] shrink-0 rounded-full bg-black/40" aria-hidden />
                        <span>
                          <span className="font-bold">{feature.title}: </span>
                          <span>{feature.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: purchase panel ── */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-6">
              <h1 className="text-[24px] font-bold text-black">{product.name}</h1>
            </div>

            <p className="text-[40px] font-bold text-[#b87333]">{formatPrice(price)}</p>

            {product.variants.length > 0 && (
              <label className="flex flex-col gap-2">
                <span className="text-[16px] text-[#09090a]">Size</span>
                <div className="relative border border-[#f2f2f2] shadow-[inset_0px_-1px_1px_0px_rgba(255,255,255,0.3)]">
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full appearance-none bg-transparent px-3 py-3 text-[16px] text-[#09090a] focus:outline-none"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.size} — {formatPrice(v.price)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <ChevronDownIcon />
                  </div>
                </div>
              </label>
            )}

            <OrderOptionSelect
              label="Delivery"
              required
              defaultValue="Drop Off (FREE)"
              options={['-- Please Select --', 'Drop Off (FREE)', 'Room of Choice Drop Off (+£19.99)']}
              onSelect={(value) => setDeliveryDelta(extractPriceDelta(value))}
            />
            <OrderOptionSelect
              label="Delay the Delivery?"
              defaultValue="No thanks"
              options={['-- Please Select --', 'No thanks', 'Yes, hold until further instructions']}
            />

            <div className="flex items-center justify-between gap-4">
              <span className="text-[15.5px] font-bold text-black">Quantity</span>
              <QuantityStepper quantity={quantity} onChange={setQuantity} />
            </div>

            <button
              type="button"
              onClick={() =>
                addToCart(
                  {
                    productId: product.id,
                    name: product.name,
                    image: activeImage ?? product.images[0],
                    price,
                    href: `/shop/mattresses/${product.slug}`,
                    sizeId: selectedVariant?.id,
                    options: selectedVariant?.size ? [{ label: 'Size', value: selectedVariant.size }] : [],
                  },
                  quantity,
                )
              }
              className="w-full rounded-[2px] bg-[#b87333] px-6 py-4 text-[15.5px] font-bold text-white transition-colors hover:bg-[#9c5f28]"
            >
              Add to cart
            </button>

            <div className="flex items-center gap-3">
              <VisaBadge />
              <MastercardBadge />
            </div>

            <div className="border-t border-stone-100 pt-8">
              <DeliveryTimeline />
            </div>
          </div>
        </div>

        {/* ── Why Choose banner (full width, above the purchase bar) ── */}
        {whyBody && (
          <div
            className="mt-12 rounded-[12px] px-10 py-10 text-center shadow-[0px_25px_25px_rgba(0,0,0,0.25)]"
            style={{ backgroundImage: 'linear-gradient(90deg, #b87333 0%, #faf5f5 51%, #b87333 100%)' }}
          >
            <h3 className="text-[32px] font-bold text-[#7d4614]">{parsed.whyHeading ?? `Why Choose ${product.name}?`}</h3>
            <p className="mx-auto mt-4 max-w-3xl text-[16px] text-black">{whyBody}</p>
          </div>
        )}

        {/* ── You may also like ── */}
        {relatedProducts.length > 0 && (
          <div className="mx-auto mt-16 flex w-full max-w-7xl flex-col gap-5">
            <h2 className="text-[22px] font-bold text-[#09090a]">You may also like</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} variant="related" />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
