'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'hero' | 'catalog'
  categoryLabel?: string
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function priceLabel(price: number | undefined, currency: string | undefined) {
  return price !== undefined ? formatPrice(price, currency ?? 'GBP') : undefined
}

function hrefFor(product: Product) {
  return `/shop/${product.category === 'mattress' ? 'mattresses' : product.category === 'fabric' ? 'fabrics' : 'beds'}`
}

export function ProductCard({ product, variant = 'default', categoryLabel }: ProductCardProps) {
  const primaryVariant = product.variants[0]
  const price = priceLabel(primaryVariant?.price ?? product.basePrice, product.currency)
  const href = hrefFor(product)
  const { addToCart } = useCart()

  if (variant === 'hero') {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#f5f5f5]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-2xl font-semibold text-white sm:text-3xl">{product.name}</p>
            {price && <p className="mt-1 text-xl font-bold text-white">{price}</p>}
          </div>
          <Link
            href={href}
            className="inline-flex items-center rounded-md bg-[#b87333] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#a3662e]"
          >
            View Details
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[405/378] w-full overflow-hidden rounded-2xl bg-[#f5f5f5]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="border-t border-stone-200 pt-2">
          <Link
            href={href}
            className="flex items-baseline justify-between gap-2 hover:text-[#b87333]"
          >
            <span className="text-lg font-normal text-[#171717]">{product.name}</span>
            {price && <span className="text-lg font-bold text-[#b87333]">{price}</span>}
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'catalog') {
    return (
      <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
        <div className="relative aspect-[296/288] w-full bg-[#f3f4f6]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
          <button
            type="button"
            aria-label="Add to cart"
            onClick={() => addToCart(product.id)}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-md hover:text-[#b87333]"
          >
            🛒
          </button>
          {categoryLabel && (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#222] px-3 py-1 text-xs font-bold text-white">
              {categoryLabel}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 p-5">
          <p className="text-lg font-medium text-[#222]">{product.name}</p>
          <div className="flex items-center justify-between">
            {price ? <span className="text-xl font-bold text-[#b87333]">{price}</span> : <span />}
            <Link href={href} className="text-sm font-medium text-[#222] hover:text-[#b87333]">
              View Details →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-400/30 bg-[#f2f2f2]">
      <div className="relative aspect-[405/400] w-full">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="text-xl font-normal text-[#222]">{product.name}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          {price ? <span className="text-2xl font-bold text-[#110d0a]">{price}</span> : <span />}
          <Link
            href={href}
            className="inline-flex items-center rounded-md bg-[#b87333] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a3662e]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
