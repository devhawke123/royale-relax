import { Card } from '@/components/ui/Card'
import { mockProducts } from '@/data/mock-products'

export default function SalePage() {
  const saleProducts = mockProducts.filter((product) =>
    product.variants.some(
      (variant) => variant.compareAtPrice && variant.compareAtPrice > variant.price,
    ),
  )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-16 lg:px-8">
      <div>
        <p className="text-sm font-semibold tracking-[0.3em] text-stone-500 uppercase">Shop</p>
        <h1 className="text-3xl font-semibold">Sale</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          A dedicated placeholder route for discounted pieces.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {saleProducts.map((product) => (
          <Card key={product.id} title={product.name} description={product.shortDescription} />
        ))}
      </div>
    </main>
  )
}
