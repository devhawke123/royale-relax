'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { parseFabricDescription } from '@/lib/fabric-description'
import {
  RatingStars,
  VisaBadge,
  MastercardBadge,
  DeliveryTimeline,
  QuantityStepper,
} from '@/components/ProductDetailPage/shared'

const SAMPLE_PRICE = 0.25

function formatSamplePrice(price: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export interface FabricSwatch {
  id: string
  code: string
  name: string
  image: string
  description?: string
}

export interface FabricDetail {
  id: string
  slug: string
  name: string
  swatches: FabricSwatch[]
}

export interface RelatedFabric {
  slug: string
  name: string
  image: string
}

function RelatedFabricCard({ fabric }: { fabric: RelatedFabric }) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <Link href={`/shop/fabrics/${fabric.slug}`} className="relative aspect-[350/193] w-full overflow-hidden bg-[#f2f2f2]">
        {fabric.image && (
          <Image src={fabric.image} alt={fabric.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 pt-4">
        <Link href={`/shop/fabrics/${fabric.slug}`} className="text-[20px] text-black hover:text-[#b87333]">
          {fabric.name}
        </Link>
        <Link
          href={`/shop/fabrics/${fabric.slug}`}
          className="mt-auto flex items-center justify-center rounded-[2px] bg-[#b87333] px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#9c5f28]"
        >
          Explore
        </Link>
      </div>
    </div>
  )
}

interface FabricDetailClientProps {
  fabric: FabricDetail
  relatedFabrics?: RelatedFabric[]
}

export function FabricDetailClient({ fabric, relatedFabrics = [] }: FabricDetailClientProps) {
  const { addToCart } = useCart()
  const [selectedSwatchId, setSelectedSwatchId] = useState(fabric.swatches[0]?.id)
  const [quantity, setQuantity] = useState(1)

  const selectedSwatch = fabric.swatches.find((s) => s.id === selectedSwatchId) ?? fabric.swatches[0]
  const parsed = useMemo(
    () => parseFabricDescription(selectedSwatch?.description ?? ''),
    [selectedSwatch?.description],
  )

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          {/* ── Left column: swatch image ── */}
          <div className="flex flex-col gap-6">
            <div className="relative aspect-square w-full max-w-[560px] overflow-hidden rounded-[3px] border border-stone-100 bg-[#e8e4e0]">
              {selectedSwatch?.image ? (
                <Image
                  src={selectedSwatch.image}
                  alt={`${fabric.name} — ${selectedSwatch.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl text-stone-400">🧵</div>
              )}
            </div>

            {(parsed.intro || parsed.features.length > 0) && (
              <div className="flex flex-col gap-6 border border-stone-100 bg-white p-6">
                <h2 className="text-[22px] font-bold text-[#09090a]">Description</h2>
                {parsed.intro && <p className="whitespace-pre-line text-[16px] leading-relaxed text-black">{parsed.intro}</p>}

                {parsed.features.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[20px] font-bold text-black">Key Features:</h3>
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

                {parsed.outro && <p className="whitespace-pre-line text-[16px] leading-relaxed text-black">{parsed.outro}</p>}
              </div>
            )}
          </div>

          {/* ── Right column: purchase panel ── */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-6">
              <h1 className="text-[24px] font-bold text-black">Fabric {fabric.name}</h1>
            </div>

            <RatingStars rating={4.9} reviewCount={150} />

            <p className="text-[40px] font-bold text-[#b87333]">{formatSamplePrice(SAMPLE_PRICE)}</p>

            {fabric.swatches.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-bold text-[#09090a]">Choose Color:</span>
                <div className="flex flex-wrap gap-6">
                  {fabric.swatches.map((swatch) => (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setSelectedSwatchId(swatch.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`relative h-[78px] w-[76px] overflow-hidden border ${
                          selectedSwatchId === swatch.id ? 'border-2 border-[#b87333]' : 'border-black'
                        }`}
                      >
                        {swatch.image && (
                          <Image src={swatch.image} alt={`${swatch.code} - ${swatch.name}`} fill sizes="76px" className="object-cover" />
                        )}
                      </span>
                      <span className="text-[10px] text-black">
                        {swatch.code} - {swatch.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <span className="text-[15.5px] font-bold text-black">Quantity</span>
              <QuantityStepper quantity={quantity} onChange={setQuantity} />
            </div>

            <button
              type="button"
              onClick={() =>
                addToCart(
                  {
                    productId: fabric.id,
                    name: `Fabric ${fabric.name}`,
                    image: selectedSwatch?.image,
                    price: SAMPLE_PRICE,
                    href: `/shop/fabrics/${fabric.slug}`,
                    fabricColorId: selectedSwatch?.id,
                    options: selectedSwatch ? [{ label: 'Colour', value: `${selectedSwatch.code} - ${selectedSwatch.name}` }] : [],
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

        {/* ── You may also like ── */}
        {relatedFabrics.length > 0 && (
          <div className="mx-auto mt-16 flex w-full max-w-7xl flex-col gap-5">
            <h2 className="text-[22px] font-bold text-[#09090a]">You may also like</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
              {relatedFabrics.map((related) => (
                <RelatedFabricCard key={related.slug} fabric={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

