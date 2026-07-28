import { Card } from '@/components/ui/Card'
import { mockProducts } from '@/data/mock-products'

export default function MattressesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-16 lg:px-8">
      <div>
        <p className="text-sm font-semibold tracking-[0.3em] text-stone-500 uppercase">Shop</p>
        <h1 className="text-3xl font-semibold">Mattresses</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          The mattress collection will live here as the storefront expands.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockProducts
          .filter((product) => product.category === 'mattress')
          .map((product) => (
            <Card key={product.id} title={product.name} description={product.shortDescription} />
          ))}
      </div>
    </main>
  )
}
