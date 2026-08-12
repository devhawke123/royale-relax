import type { Product } from '@/types/product'
import { ProductCard } from '@/components/ui/ProductCard'

interface ProductCarouselProps {
  items: Product[]
  title?: string
  description?: string
}

const categoryLabels: Record<Product['category'], string> = {
  bed: 'Storage Beds',
  mattress: 'Mattresses',
  fabric: 'Fabric Sample',
}

export function ProductCarousel({ items, title, description }: ProductCarouselProps) {
  return (
    <section className="bg-[#f5f5f5] px-6 py-16 sm:py-20 xl:px-8">
      {(title || description) && (
        <div className="mx-auto max-w-2xl text-center">
          {title && (
            <h2 className="text-3xl font-bold text-[#222] capitalize sm:text-4xl">{title}</h2>
          )}
          {description && <p className="mt-4 text-stone-500">{description}</p>}
        </div>
      )}
      <div className="mx-auto mt-10 flex max-w-7xl snap-x justify-center gap-6 overflow-x-auto pb-2">
        {items.map((product) => (
          <div key={product.id} className="w-64 shrink-0 snap-start sm:w-72">
            <ProductCard
              product={product}
              variant="catalog"
              categoryLabel={categoryLabels[product.category]}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
