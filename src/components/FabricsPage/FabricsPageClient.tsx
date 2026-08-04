'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/product'

const SAMPLE_PRICE = 0.25

function formatSamplePrice(price: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

function FabricCard({ product }: { product: Product }) {
  const imageSrc = product.images[0] ?? ''

  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] border border-stone-200/70 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8e4e0]">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex items-end justify-between border-t border-stone-200 px-6 py-4">
        <span className="text-[15px] font-normal text-[#222]">
          <span className="inline-block border-b border-stone-300 pb-1">{product.name}</span>
        </span>
        <span className="ml-4 shrink-0 text-[15px] font-semibold text-[#B87333]">
          {formatSamplePrice(SAMPLE_PRICE)}
        </span>
      </div>
    </div>
  )
}

interface FabricsPageClientProps {
  products: Product[]
}

export function FabricsPageClient({ products }: FabricsPageClientProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero Banner ── */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[320px]">
        <Image
          src="/images/lifestyle/fabric-hero.svg"
          alt="Fabric samples"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />

        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-2 text-center pb-12"
          style={{ top: 'var(--header-height, 180px)' }}
        >
          <h1 className="text-4xl font-bold tracking-wide text-white sm:text-5xl">Fabric Samples</h1>
          <p className="text-sm text-white/80">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2 text-white/50">/</span>
            <span className="text-white">Fabric Samples</span>
          </p>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        {products.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-stone-400">
            <span className="text-5xl">🧵</span>
            <p className="text-lg">No fabric samples available right now.</p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <FabricCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
