'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { Product, ProductColorway } from '@/types/product'
import { parseBedDescription } from '@/lib/bed-description'
import { useCart } from '@/lib/cart-context'

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price)
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-stone-500">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} className="h-5 w-5">
      <path
        d="M12 21s-7.5-4.6-10.2-9.3C.2 8.6 1.6 5 5.1 4.1c2.2-.6 4.4.3 5.9 2.2 1.5-1.9 3.7-2.8 5.9-2.2 3.5.9 4.9 4.5 3.3 7.6C19.5 16.4 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * A single "-- Please Select --" style dropdown for order add-ons that don't
 * yet have a backing data model (delivery service, blanket box, staircase
 * split, headboard height, delivery delay). Kept as real <select> elements
 * so they're usable, but the option lists are static per the Figma design
 * rather than sourced from the product.
 */
function OrderOptionSelect({
  label,
  required,
  options,
}: {
  label: string
  required?: boolean
  options: string[]
}) {
  return (
    <label className="flex w-full flex-col gap-2 border border-[#71717a] px-4 py-3">
      <span className="text-[12.6px] text-black/70">
        {label} {required && <span className="text-[#de3618]">*</span>}
      </span>
      <div className="flex items-center justify-between gap-2">
        <select className="w-full appearance-none bg-transparent text-[16px] text-[#353535] focus:outline-none">
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon />
      </div>
    </label>
  )
}

function colorwayLabel(colorway: ProductColorway, index: number) {
  if (/^rectangle/i.test(colorway.name)) return `Colour ${index + 1}`
  return colorway.name
}

function VisaBadge() {
  return (
    <span className="flex h-8 w-12 items-center justify-center rounded-[4px] border border-stone-200 bg-white">
      <svg viewBox="0 0 48 16" className="h-3.5 w-9" aria-label="Visa">
        <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="15" fill="#1a1f71">
          VISA
        </text>
      </svg>
    </span>
  )
}

function MastercardBadge() {
  return (
    <span className="flex h-8 w-12 items-center justify-center rounded-[4px] border border-stone-200 bg-white">
      <svg viewBox="0 0 40 24" className="h-5 w-8" aria-label="Mastercard">
        <circle cx="16" cy="12" r="9" fill="#eb001b" />
        <circle cx="24" cy="12" r="9" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    </span>
  )
}

function QuantityStepper({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) {
  return (
    <div className="flex items-center gap-4 border border-stone-300 px-4 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="Decrease quantity"
        className="flex h-6 w-6 items-center justify-center text-lg text-stone-600 hover:text-[#b87333]"
      >
        −
      </button>
      <span className="min-w-[1.5ch] text-center text-[16px] text-black">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className="flex h-6 w-6 items-center justify-center text-lg text-stone-600 hover:text-[#b87333]"
      >
        +
      </button>
    </div>
  )
}

interface BedDetailClientProps {
  product: Product
  fabricSwatches: { id: string; name: string; image: string }[]
}

export function BedDetailClient({ product, fabricSwatches }: BedDetailClientProps) {
  const { toggleWishlist, isWishlisted, addToCart } = useCart()
  const parsed = useMemo(() => parseBedDescription(product.description ?? ''), [product.description])

  const colors = product.colors ?? []

  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id)
  const [selectedColorId, setSelectedColorId] = useState(colors[0]?.id)
  const [selectedFabricId, setSelectedFabricId] = useState(fabricSwatches[0]?.id)
  const [quantity, setQuantity] = useState(1)

  const selectedColor = colors.find((c) => c.id === selectedColorId) ?? colors[0]
  const [activeImage, setActiveImage] = useState(selectedColor?.images[0] ?? product.images[0])

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0]
  const price = selectedVariant?.price ?? product.basePrice ?? 0

  const wishlisted = isWishlisted(product.id)
  // Drawer beds (Kendal, Luxe, Madison) ship with under-bed drawers built
  // in — there's nothing to opt into. Only ottoman-storage beds have this
  // as an add-on choice.
  const hasOttomanOption = product.hasStorage

  const thumbnails = colors.flatMap((c) => c.images.slice(0, 1))

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          {/* ── Left column: gallery + description ── */}
          <div className="flex flex-col gap-6">
            {/* Gallery */}
            <div className="flex gap-3 rounded-[3px] border border-stone-100 bg-white p-2">
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
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={wishlisted}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`shrink-0 transition-colors ${wishlisted ? 'text-[#b87333]' : 'text-stone-400 hover:text-[#b87333]'}`}
              >
                <HeartIcon filled={wishlisted} />
              </button>
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

            {hasOttomanOption && (
              <OrderOptionSelect
                label="Would you like to add ottoman storage to your bed?"
                required
                options={['No Storage', 'Yes — Add Ottoman Storage']}
              />
            )}

            {colors.length > 1 && (
              <div className="flex flex-col gap-3">
                <span className="text-[12.8px] text-black/70">Choose Bed Colour</span>
                <div className="flex flex-wrap gap-6">
                  {colors.map((color, i) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setSelectedColorId(color.id)
                        if (color.images[0]) setActiveImage(color.images[0])
                      }}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`relative h-[78px] w-[76px] overflow-hidden border ${
                          selectedColorId === color.id ? 'border-2 border-[#b87333]' : 'border-black'
                        }`}
                      >
                        {color.images[0] ? (
                          <Image src={color.images[0]} alt={colorwayLabel(color, i)} fill sizes="76px" className="object-cover" />
                        ) : null}
                      </span>
                      <span className="text-[10px] text-black">{colorwayLabel(color, i)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <OrderOptionSelect
              label="Delivery Service"
              required
              options={['Downstairs Drop Off (FREE)', 'Room of Choice (+£49)']}
            />
            <OrderOptionSelect
              label="Add a Matching Design Blanket Box"
              options={['No Thanks', 'Yes — Add Matching Blanket Box']}
            />
            <OrderOptionSelect
              label="Awkward Staircase? Get a Split Head"
              options={['No, I have checked my staircase, 1 Part Headboard will fit', 'Yes, please split my headboard']}
            />
            <OrderOptionSelect
              label="Choose Headboard Height"
              options={['Standard Height', 'Made to Measure — leave a note at checkout']}
            />
            <OrderOptionSelect label="Delay the Delivery?" options={['No thanks', 'Yes, please delay']} />

            {fabricSwatches.length > 0 && (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-[12.8px] text-black/70">Choose Fabric</span>
                  <div className="relative border border-[#71717a] px-4 py-3">
                    <select
                      value={selectedFabricId}
                      onChange={(e) => setSelectedFabricId(e.target.value)}
                      className="w-full appearance-none bg-transparent text-[16px] text-[#353535] focus:outline-none"
                    >
                      <option value="">-- Please Select --</option>
                      {fabricSwatches.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </label>
                <div className="grid grid-cols-5 gap-x-4 gap-y-4">
                  {fabricSwatches.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFabricId(f.id)}
                      className="flex flex-col items-start gap-1"
                    >
                      <span
                        className={`relative h-[78px] w-[76px] overflow-hidden ${
                          selectedFabricId === f.id ? 'ring-2 ring-[#b87333]' : ''
                        }`}
                      >
                        <Image src={f.image} alt={f.name} fill sizes="76px" className="object-cover" />
                      </span>
                      <span className="text-[10px] text-black">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Why Choose banner (full width, above the purchase bar) ── */}
        {parsed.whyBody && (
          <div
            className="mt-12 rounded-[12px] px-10 py-10 text-center shadow-[0px_25px_25px_rgba(0,0,0,0.25)]"
            style={{ backgroundImage: 'linear-gradient(90deg, #b87333 0%, #faf5f5 51%, #b87333 100%)' }}
          >
            <h3 className="text-[32px] font-bold text-[#7d4614]">
              {parsed.whyHeading ?? `Why Choose ${product.name}?`}
            </h3>
            <p className="mx-auto mt-4 max-w-3xl text-[16px] text-black">{parsed.whyBody}</p>
          </div>
        )}

        {/* ── Final purchase bar: price, quantity, add to cart, payment badges ── */}
        <div className="mx-auto mt-10 flex max-w-xl flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-semibold text-black">Price:</span>
            <span className="text-[20px] font-bold text-[#b87333]">{formatPrice(price * quantity)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-semibold text-black">Quantity</span>
            <QuantityStepper quantity={quantity} onChange={setQuantity} />
          </div>
          <button
            type="button"
            onClick={() => Array.from({ length: quantity }).forEach(() => addToCart(product.id))}
            className="w-full rounded-full bg-[#b87333] px-6 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#9c5f28]"
          >
            Add to Cart
          </button>
          <div className="flex items-center justify-center gap-3">
            <VisaBadge />
            <MastercardBadge />
          </div>
        </div>
      </div>
    </main>
  )
}
