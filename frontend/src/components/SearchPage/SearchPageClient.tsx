'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard } from '@/components/ui/ProductCard'
import type { Product } from '@/types/product'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-stone-400">
      <path
        d="M20 20L15.8033 15.8033M18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C14.6421 18 18 14.6421 18 10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const categoryLabels: Record<Product['category'], string> = {
  bed: 'Bed',
  mattress: 'Mattress',
  fabric: 'Fabric',
}

interface SearchPageClientProps {
  query: string
  results: Product[]
}

export function SearchPageClient({ query, results }: SearchPageClientProps) {
  const router = useRouter()
  const [value, setValue] = useState(query)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 xl:px-8">
        <div className="flex flex-col gap-2 border-b border-stone-100 pb-6">
          <h1 className="text-[36px] font-medium text-black capitalize">Search</h1>
          <form onSubmit={handleSubmit} className="flex w-full max-w-xl items-center gap-3 rounded-full border border-stone-300 px-5 py-3">
            <SearchIcon />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search for beds, mattresses..."
              autoFocus
              className="w-full bg-transparent text-[15px] text-black outline-none placeholder:text-stone-400"
            />
          </form>
        </div>

        <div className="mt-8">
          {query === '' ? (
            <p className="py-16 text-center text-[16px] text-[#6a6d70]">
              Start typing to search our beds and mattresses.
            </p>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-[16px] font-medium text-black">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[14px] text-[#6a6d70]">Try a different search term.</p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-[14px] text-[#6a6d70]">
                {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
              </p>
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="catalog"
                    categoryLabel={categoryLabels[product.category]}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
