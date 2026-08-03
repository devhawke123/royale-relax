import { prisma } from '@/lib/prisma'
import { toDisplayProduct } from '@/lib/products'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import React from 'react'

export const metadata = {
  title: 'Bed | Royale Relax',
}

export default async function BedDetailPage({ params }: { params: { slug: string } }) {
  const raw = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      colors: { orderBy: { sortOrder: 'asc' as const }, include: { images: { orderBy: { sortOrder: 'asc' as const } } } },
      variants: { orderBy: { size: 'asc' as const } },
    },
  })

  if (!raw) return notFound()
  const product = toDisplayProduct(raw as any)

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8e4e0]">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill sizes="100vw" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#e8e4e0]">
                <span className="text-6xl text-stone-400">🛏</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-lg text-[#B87333]">
            {product.variants && product.variants.length > 0 ? (
              <>From {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(product.variants[0].price)}</>
            ) : (
              <>{product.basePrice ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(product.basePrice) : ''}</>
            )}
          </p>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <label className="mb-2 block text-sm text-stone-600">Choose size</label>
              <select className="w-full rounded border border-stone-300 p-2">
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.size} — {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v.price)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-6 text-sm text-stone-500">Added {new Date(product.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </main>
  )
}
