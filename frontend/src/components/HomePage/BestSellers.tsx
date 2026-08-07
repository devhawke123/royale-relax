import type { Product } from '@/types/product'
import { ProductCard } from '@/components/ui/ProductCard'

interface BestSellersProps {
  products: Product[]
}

export function BestSellers({ products }: BestSellersProps) {
  const [hero, ...rest] = products
  const sideCards = rest.slice(0, 2)
  const bottomCards = rest.slice(2, 5)

  return (
    <section className="bg-[#f5f5f5] px-6 py-16 xl:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-[#222] capitalize sm:text-4xl">Best Selling Beds</h2>
        <p className="mt-4 text-stone-500">
          Discover our most popular beds, handpicked by thousands of satisfied customers
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-7xl">
        {hero && (
          <div className="grid gap-6 lg:h-[460px] lg:grid-cols-[2fr_1fr]">
            <div className="min-h-[380px] lg:min-h-0">
              <ProductCard product={hero} variant="hero" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:auto-rows-fr">
              {sideCards.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  variant="compact"
                  imageClassName="aspect-[405/378] lg:aspect-auto lg:flex-1 lg:min-h-0"
                />
              ))}
            </div>
          </div>
        )}

        {bottomCards.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bottomCards.map((product, index) => (
              <ProductCard key={`${product.id}-${index}`} product={product} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
