'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { Product, ProductAddon } from '@/types/product'
import { parseBedDescription } from '@/lib/bed-description'
import { useCart, type CartAddonSelection } from '@/lib/cart-context'
import { getDeliveryEstimate } from '@/lib/delivery-estimate'
import { ProductCard } from '@/components/ui/ProductCard'

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price)
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 shrink-0 text-stone-500 transition-transform ${className}`}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface ListboxOption {
  value: string
  label: string
}

/**
 * A polished, custom-styled dropdown used for every "Choose ..." field on
 * this page (delivery service, blanket box, staircase split, headboard
 * height, delivery delay, fabric type). Built as a listbox rather than a
 * native <select> so the open menu can carry the site's own styling
 * (brand-colour selected state, rounded panel) instead of the browser's
 * default popup, which every field otherwise falls back to.
 */
function Listbox({
  label,
  required,
  value,
  onChange,
  options,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  options: ListboxOption[]
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col gap-1 border border-[#71717a] px-3 py-2"
    >
      <span className="text-[11px] text-black/70">
        {label} {required && <span className="text-[#de3618]">*</span>}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 bg-transparent text-left text-[14px] text-[#353535] focus:outline-none"
      >
        <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
        <ChevronDownIcon className={open ? 'rotate-180' : ''} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-[6px] border border-stone-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`block w-full px-4 py-2.5 text-left text-[15px] transition-colors ${
                  option.value === value ? 'bg-[#b87333] text-white' : 'text-[#353535] hover:bg-stone-100'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** State the customer has picked for one product.addons[] entry, keyed by addon.id. */
type AddonSelection = { optionId?: string; toggleOn?: boolean; textValue?: string }
type AddonSelections = Record<string, AddonSelection>

function defaultAddonSelections(addons: ProductAddon[]): AddonSelections {
  const initial: AddonSelections = {}
  for (const addon of addons) {
    if (addon.type === 'SELECT') {
      initial[addon.id] = { optionId: addon.options[0]?.id }
    } else if (addon.type === 'TOGGLE') {
      initial[addon.id] = { toggleOn: false }
    } else {
      initial[addon.id] = { textValue: '' }
    }
  }
  return initial
}

/** basePrice + variant modifier + whatever the customer currently has selected across product.addons. */
function addonsPriceDelta(addons: ProductAddon[], selections: AddonSelections): number {
  return addons.reduce((sum, addon) => {
    const selection = selections[addon.id]
    if (!selection) return sum
    if (addon.type === 'SELECT') {
      const option = addon.options.find((o) => o.id === selection.optionId)
      return option ? sum + addon.price + option.priceModifier : sum
    }
    if (addon.type === 'TOGGLE') {
      return sum + (selection.toggleOn ? addon.price : addon.noPrice)
    }
    return sum
  }, 0)
}

/**
 * The main price tag rounds to whole pounds (see formatPrice above), but a
 * "(+£19.99)" surcharge needs its pence to survive — a rounded "(+£20)" would
 * silently misquote the actual addon price.
 */
function formatAddonSurcharge(price: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

function addonOptionLabel(label: string, priceModifier: number): string {
  return priceModifier > 0 ? `${label} (+${formatAddonSurcharge(priceModifier)})` : label
}

/**
 * Turns the customer's current addon picks into what the cart/checkout need:
 * human-readable `options` for the order summary, and `selectedAddons` (real
 * addon/option ids) that lib/checkout.ts uses to independently re-price and
 * validate the order server-side — the client's `price` is display-only.
 */
function buildAddonCartData(
  addons: ProductAddon[],
  selections: AddonSelections,
): { options: { label: string; value: string }[]; selectedAddons: CartAddonSelection[] } {
  const options: { label: string; value: string }[] = []
  const selectedAddons: CartAddonSelection[] = []

  for (const addon of addons) {
    const selection = selections[addon.id]
    if (!selection) continue

    if (addon.type === 'SELECT') {
      const option = addon.options.find((o) => o.id === selection.optionId)
      if (!option) continue
      options.push({ label: addon.name, value: option.label })
      selectedAddons.push({ addonId: addon.id, selectedOptionId: option.id })
    } else if (addon.type === 'TOGGLE') {
      options.push({ label: addon.name, value: selection.toggleOn ? 'Yes' : 'No' })
      selectedAddons.push({ addonId: addon.id, toggleOn: Boolean(selection.toggleOn) })
    } else {
      const textValue = selection.textValue?.trim()
      if (!textValue) continue
      options.push({ label: addon.name, value: textValue })
      selectedAddons.push({ addonId: addon.id, textValue })
    }
  }

  return { options, selectedAddons }
}

/**
 * Renders one admin-configured option group (Ottoman Storage, Delivery
 * Service, Blanket Box, Split Head, Headboard Height, Delay Delivery, ...) as
 * a dropdown (SELECT), a Yes/No dropdown (TOGGLE), or a text field
 * (TEXT_INPUT) — whatever the admin set up for this product.
 */
function AddonField({
  addon,
  selection,
  onChange,
}: {
  addon: ProductAddon
  selection: AddonSelection
  onChange: (next: AddonSelection) => void
}) {
  if (addon.type === 'SELECT') {
    return (
      <Listbox
        label={addon.name}
        required={addon.isRequired}
        value={selection.optionId ?? ''}
        onChange={(optionId) => onChange({ optionId })}
        options={addon.options.map((option) => ({
          value: option.id,
          label: addonOptionLabel(option.label, option.priceModifier),
        }))}
      />
    )
  }

  if (addon.type === 'TOGGLE') {
    return (
      <Listbox
        label={addon.name}
        required={addon.isRequired}
        value={selection.toggleOn ? 'yes' : 'no'}
        onChange={(value) => onChange({ toggleOn: value === 'yes' })}
        options={[
          { value: 'no', label: addonOptionLabel('No', addon.noPrice) },
          { value: 'yes', label: addonOptionLabel('Yes', addon.price) },
        ]}
      />
    )
  }

  return (
    <label className="flex w-full flex-col gap-1 border border-[#71717a] px-3 py-2">
      <span className="text-[11px] text-black/70">
        {addon.name} {addon.isRequired && <span className="text-[#de3618]">*</span>}
      </span>
      <input
        type="text"
        required={addon.isRequired}
        value={selection.textValue ?? ''}
        onChange={(e) => onChange({ textValue: e.target.value })}
        className="w-full bg-transparent text-[14px] text-[#353535] focus:outline-none"
      />
    </label>
  )
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

function OrderPlacedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
      <path
        d="M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DispatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
      <path
        d="M3 7h11v9H3V7Z M14 10h4l3 3v3h-7v-6Z M6.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M16.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeliveredIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
      <path
        d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z M3 8.5V16l9 4.5 9-4.5V8.5 M12 13v7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeliveryTimeline() {
  const estimate = useMemo(() => getDeliveryEstimate(), [])

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className="text-[24px] leading-none text-black sm:text-[28px]">{estimate.estimatedArrivalLabel}</span>
        <span className="pb-0.5 text-[15px] text-black sm:text-[16px]">Estimated arrival</span>
      </div>
      <div className="mt-8 flex items-center">
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black">
          <OrderPlacedIcon />
        </span>
        <span className="h-px flex-1 bg-black" />
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black">
          <DispatchIcon />
        </span>
        <span className="h-px flex-1 bg-black" />
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black">
          <DeliveredIcon />
        </span>
      </div>
      <div className="mt-2 flex items-start justify-between text-[13px] text-black">
        <div className="flex flex-col">
          <span>{estimate.orderPlacedLabel}</span>
          <span>Order placed</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span>{estimate.dispatchRangeLabel}</span>
          <span>Order dispatches</span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span>{estimate.estimatedArrivalLabel}</span>
          <span>Delivered!</span>
        </div>
      </div>
    </div>
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

interface FabricSwatch {
  id: string
  code: string | null
  name: string
  image: string
}

interface FabricType {
  id: string
  slug: string
  name: string
  swatches: FabricSwatch[]
}

function swatchLabel(swatch: FabricSwatch) {
  return swatch.code ? `${swatch.code} - ${swatch.name}` : swatch.name
}

interface BedDetailClientProps {
  product: Product
  fabrics: FabricType[]
  relatedProducts?: Product[]
}

export function BedDetailClient({ product, fabrics, relatedProducts = [] }: BedDetailClientProps) {
  const { addToCart } = useCart()
  const parsed = useMemo(() => parseBedDescription(product.description ?? ''), [product.description])
  const addons = product.addons ?? []

  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id)
  const [selectedFabricSlug, setSelectedFabricSlug] = useState('')
  const [selectedFabricSwatchId, setSelectedFabricSwatchId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [payInInstallments, setPayInInstallments] = useState(false)
  const [addonSelections, setAddonSelections] = useState<AddonSelections>(() => defaultAddonSelections(addons))

  const selectedFabricType = fabrics.find((f) => f.slug === selectedFabricSlug)
  const fabricSwatches = selectedFabricType?.swatches ?? []

  const [activeImage, setActiveImage] = useState(product.images[0])

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0]
  const basePrice = selectedVariant?.price ?? product.basePrice ?? 0
  const price = basePrice + addonsPriceDelta(addons, addonSelections)
  // Sizes show what they add over the cheapest size, not their absolute price — a
  // £0 modifier now reads as "no extra cost" instead of a confusing flat number.
  const cheapestVariantPrice = product.variants.length ? Math.min(...product.variants.map((v) => v.price)) : 0

  const thumbnails = product.images

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 xl:px-8">
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          {/* ── Left column: gallery + description ── */}
          <div className="flex min-w-0 flex-col gap-6">
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
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-6">
              <h1 className="text-[24px] font-bold text-black">{product.name}</h1>
            </div>

            <p className="text-[40px] font-bold text-[#b87333]">{formatPrice(price)}</p>

            {product.variants.length > 0 && (
              <label className="flex flex-col gap-1">
                <span className="text-[14px] text-[#09090a]">Size</span>
                <div className="relative border border-[#f2f2f2] shadow-[inset_0px_-1px_1px_0px_rgba(255,255,255,0.3)]">
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full appearance-none truncate bg-transparent py-2 pr-9 pl-3 text-[14px] text-[#09090a] focus:outline-none"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {addonOptionLabel(v.size ?? '', v.price - cheapestVariantPrice)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <ChevronDownIcon />
                  </div>
                </div>
              </label>
            )}

            {addons.map((addon) => (
              <AddonField
                key={addon.id}
                addon={addon}
                selection={addonSelections[addon.id] ?? {}}
                onChange={(next) =>
                  setAddonSelections((prev) => ({ ...prev, [addon.id]: { ...prev[addon.id], ...next } }))
                }
              />
            ))}

            {fabrics.length > 0 && (
              <div className="flex flex-col gap-3">
                <Listbox
                  label="Choose Fabric"
                  value={selectedFabricSlug}
                  onChange={(value) => {
                    setSelectedFabricSlug(value)
                    setSelectedFabricSwatchId('')
                  }}
                  options={[
                    { value: '', label: '-- Please Select --' },
                    ...fabrics.map((f) => ({ value: f.slug, label: f.name })),
                  ]}
                />
                {fabricSwatches.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 xs:grid-cols-4 sm:grid-cols-5">
                    {fabricSwatches.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFabricSwatchId(f.id)}
                        className="flex flex-col items-start gap-1"
                      >
                        <span
                          className={`relative aspect-square w-full overflow-hidden ${
                            selectedFabricSwatchId === f.id ? 'ring-2 ring-[#b87333]' : ''
                          }`}
                        >
                          <Image src={f.image} alt={swatchLabel(f)} fill sizes="80px" className="object-cover" />
                        </span>
                        <span className="text-[10px] text-black">{swatchLabel(f)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12.8px] text-black/50">Select a fabric above to see available colours.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Why Choose banner (full width, above the purchase bar) ── */}
        {parsed.whyBody && (
          <div
            className="mt-12 rounded-[12px] px-5 py-8 text-center shadow-[0px_25px_25px_rgba(0,0,0,0.25)] sm:px-10 sm:py-10"
            style={{ backgroundImage: 'linear-gradient(90deg, #b87333 0%, #faf5f5 51%, #b87333 100%)' }}
          >
            <h3 className="text-2xl font-bold text-[#7d4614] sm:text-[32px]">
              {parsed.whyHeading ?? `Why Choose ${product.name}?`}
            </h3>
            <p className="mx-auto mt-4 max-w-3xl text-[16px] text-black">{parsed.whyBody}</p>
          </div>
        )}

        {/* ── Final purchase bar: price, quantity, add to cart, payment badges, delivery estimate ── */}
        <div className="mx-auto mt-10 flex w-full max-w-3xl flex-col gap-4 border border-stone-100 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15.5px] font-bold text-black">Price:</span>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[22px] font-bold text-[#0a8b0a]">
                {formatPrice(payInInstallments ? (price * quantity) / 4 : price * quantity)}
              </span>
              <button
                type="button"
                onClick={() => setPayInInstallments((v) => !v)}
                aria-pressed={payInInstallments}
                className={`text-[13px] transition-colors ${
                  payInInstallments ? 'font-semibold text-[#b87333] underline' : 'text-black hover:text-[#b87333]'
                }`}
              >
                {payInInstallments
                  ? `Paying today · 4 interest-free payments of ${formatPrice((price * quantity) / 4)}`
                  : `or 4 interest-free payments of ${formatPrice((price * quantity) / 4)}`}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15.5px] font-bold text-black">Quantity</span>
            <QuantityStepper quantity={quantity} onChange={setQuantity} />
          </div>
          <button
            type="button"
            onClick={() => {
              const selectedFabricSwatch = fabricSwatches.find((f) => f.id === selectedFabricSwatchId)
              const addonCartData = buildAddonCartData(addons, addonSelections)
              addToCart(
                {
                  productId: product.id,
                  name: product.name,
                  image: activeImage ?? product.images[0],
                  price,
                  href: `/shop/beds/${product.slug}`,
                  sizeId: selectedVariant?.id,
                  fabricColorId: selectedFabricSwatch?.id,
                  selectedAddons: addonCartData.selectedAddons,
                  options: [
                    ...(selectedVariant?.size ? [{ label: 'Size', value: selectedVariant.size }] : []),
                    ...(selectedFabricType
                      ? [{ label: 'Fabric', value: selectedFabricType.name }]
                      : []),
                    ...(selectedFabricSwatch
                      ? [{ label: 'Colour', value: swatchLabel(selectedFabricSwatch) }]
                      : []),
                    ...addonCartData.options,
                  ],
                },
                quantity,
              )
            }}
            className="w-full rounded-[2px] bg-[#b87333] px-6 py-4 text-[15.5px] font-bold text-white transition-colors hover:bg-[#9c5f28]"
          >
            Add to cart
          </button>
          <div className="flex items-center gap-3">
            <VisaBadge />
            <MastercardBadge />
          </div>

          <div className="mt-6 border-t border-stone-100 pt-8">
            <DeliveryTimeline />
          </div>
        </div>

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
