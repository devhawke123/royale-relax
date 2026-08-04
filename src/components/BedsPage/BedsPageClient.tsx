'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/product'

type FilterKey = 'all' | 'storage' | 'drawer'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'storage', label: 'Storage Beds' },
  { key: 'drawer', label: 'Drawer Beds' },
]

function filterProducts(products: Product[], filter: FilterKey): Product[] {
  if (filter === 'all') return products
  if (filter === 'storage') {
    return products.filter((p) => p.hasStorage === true)
  }
  if (filter === 'drawer') {
    return products.filter((p) => p.hasDrawer === true)
  }
  return products
}

function formatPrice(price: number | undefined, currency = 'GBP') {
  if (price === undefined) return null
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

function BedCard({ product }: { product: Product }) {
  const href = `/shop/beds/${product.slug}`
  const imageSrc = product.images[0] ?? ''
  // Determine price display: prefer variants (show "From £x"), otherwise show basePrice
  const variantPrices = product.variants?.map((v) => v.price ?? 0) ?? []
  const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : undefined
  const priceLabel = minVariantPrice !== undefined ? `From ${formatPrice(minVariantPrice, product.currency)}` : formatPrice(product.basePrice, product.currency)

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[28px] border border-stone-200/70 bg-white shadow-sm transition duration-300 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8e4e0]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#e8e4e0]">
            <span className="text-4xl text-stone-400">🛏</span>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-end justify-between border-t border-stone-200 px-6 py-4">
        <span className="text-[15px] font-normal text-[#222]">
          <span className="inline-block border-b border-stone-300 pb-1">{product.name}</span>
        </span>
        {priceLabel && (
          <span className="ml-4 shrink-0 text-[15px] font-semibold text-[#B87333]">
            {priceLabel}
          </span>
        )}
      </div>
    </Link>
  )
}

interface BedsPageClientProps {
  products: Product[]
  initialFilter?: FilterKey
  serverFiltered?: boolean
}

export function BedsPageClient({ products, initialFilter, serverFiltered }: BedsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>(initialFilter ?? 'all')
  // If the server already returned a pre-filtered list (storage/drawer pages),
  // don't apply the client-side name/slug-based filter again — use products as-is.
  const visible = serverFiltered ? products : filterProducts(products, activeFilter)

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero Banner ── */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[320px]">
        <Image
          src="/images/lifestyle/hero-bedroom.jpg"
          alt="Beds collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Text — centered within the space below the fixed/transparent header
            (which overlays the top of this banner), not the full banner height,
            so it reads as centered without colliding with the nav. Uses the
            header's real measured height (--header-height, set in Header.tsx)
            rather than a guessed pixel value. */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-2 text-center pb-12"
          style={{ top: 'var(--header-height, 180px)' }}
        >
          <h1 className="text-4xl font-bold tracking-wide text-white sm:text-5xl">Beds</h1>
          <p className="text-sm text-white/80">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2 text-white/50">/</span>
            <span className="text-white">Beds</span>
          </p>
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-6 py-4 xl:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={activeFilter === f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`h-11 rounded-full px-6 text-sm font-normal transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                  activeFilter === f.key
                    ? 'bg-[#B87333] text-white shadow-sm'
                    : 'border border-stone-300 bg-stone-100 text-stone-700 shadow-sm hover:border-stone-400 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-sm text-stone-400">
            {visible.length} {visible.length === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        {visible.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-stone-400">
            <span className="text-5xl">🛏</span>
            <p className="text-lg">No beds found in this category.</p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <BedCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
