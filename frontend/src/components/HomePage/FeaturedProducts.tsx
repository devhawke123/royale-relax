import type { Product } from '@/types/product'
import { ProductCard } from '@/components/ui/ProductCard'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="bg-[#f5f5f5] px-6 py-16 sm:py-20 xl:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold text-[#222] capitalize sm:text-4xl">
          Featured Products
        </h2>
        <div className="mx-auto mt-4 h-px w-24 bg-stone-300" />
        <p className="mt-4 text-stone-500">
          Discover our handpicked selection of luxury beds designed to transform your bedroom
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
