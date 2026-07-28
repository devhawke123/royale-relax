import { Card } from '@/components/ui/Card'
import { mockFabricFamilies } from '@/data/mock-fabrics'

export default function FabricsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-16 lg:px-8">
      <div>
        <p className="text-sm font-semibold tracking-[0.3em] text-stone-500 uppercase">Shop</p>
        <h1 className="text-3xl font-semibold">Fabrics</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Fabric families and colorways will be presented in a dedicated browse experience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockFabricFamilies.map((fabric) => (
          <Card key={fabric.id} title={fabric.name} description={fabric.description} />
        ))}
      </div>
    </main>
  )
}
