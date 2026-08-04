'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/product'

function formatPrice(price: number | undefined, currency = 'GBP') {
  if (!price) return null
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

function MattressCard({ product }: { product: Product }) {
  const imageSrc = product.images[0] ?? ''
  const priceLabel = formatPrice(product.basePrice, product.currency)

  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] border border-stone-200/70 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8e4e0]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#e8e4e0]">
            <span className="text-4xl text-stone-400">🛏</span>
          </div>
        )}
      </div>

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
    </div>
  )
}

interface MattressesPageClientProps {
  products: Product[]
}

export function MattressesPageClient({ products }: MattressesPageClientProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero Banner ── */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[320px]">
        <Image
          src="/images/lifestyle/Mattreses-Hero.svg"
          alt="Mattresses collection"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20" />

        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-2 text-center pb-12"
          style={{ top: 'var(--header-height, 180px)' }}
        >
          <h1 className="text-4xl font-bold tracking-wide text-white sm:text-5xl">Mattresses</h1>
          <p className="text-sm text-white/80">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2 text-white/50">/</span>
            <span className="text-white">Mattresses</span>
          </p>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        {products.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-stone-400">
            <span className="text-5xl">🛏</span>
            <p className="text-lg">No mattresses available right now.</p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <MattressCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
