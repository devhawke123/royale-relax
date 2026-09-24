import type { Product } from '@/types/product'
import { ProductCard } from '@/components/ui/ProductCard'

interface BestSellersProps {
  products: Product[]
}

export function BestSellers({ products }: BestSellersProps) {
  const [hero, ...rest] = products
  const [grandRegentBed, majesticBed] = rest.slice(0, 2)
  const bottomCards = rest.slice(2, 5)

  // Only stretch the right column when the bottom row leaves column 3 empty
  const fillRight = bottomCards.length > 0 && bottomCards.length < 3

  if (!hero) return null

  return (
    <section className="bg-[#f5f5f5] px-6 py-16 sm:py-20 xl:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-[#222] capitalize sm:text-4xl">Best Selling Beds</h2>
        <p className="mt-4 text-stone-500">
          Discover our most popular beds, handpicked by thousands of satisfied customers
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-6 lg:grid-cols-3 lg:grid-rows-[460px_auto]">
        {/* Hero: row 1, columns 1–2 (same size as before) */}
        <div className="min-h-[380px] lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:min-h-0">
          <ProductCard product={hero} variant="hero" />
        </div>

        {/* Right column: spans both rows when there's empty space below it */}
        <div
          className={`grid gap-4 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:grid-cols-1 lg:auto-rows-fr ${
            fillRight ? 'lg:row-span-2 lg:[contain:size]' : ''
          }`}
        >
          {grandRegentBed && (
            <ProductCard
              product={grandRegentBed}
              variant="compact"
              imageClassName="aspect-[405/378] lg:aspect-auto lg:flex-1 lg:min-h-0"
            />
          )}
          {majesticBed && (
            <ProductCard
              product={majesticBed}
              variant="compact"
              imageClassName="aspect-[405/378] lg:aspect-auto lg:flex-1 lg:min-h-0"
            />
          )}
        </div>

        {/* Bottom cards auto-flow into row 2, columns 1–2 (or 1–3 if there are three) */}
        {bottomCards.map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} product={product} variant="compact" />
        ))}
      </div>
    </section>
  )
}