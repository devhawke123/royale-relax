import { searchProducts, toDisplayProduct } from '@/lib/products'
import { SearchPageClient } from '@/components/SearchPage/SearchPageClient'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return {
    title: q ? `Search results for "${q}" | Royale Relax` : 'Search | Royale Relax',
    description: 'Search Royale Relax beds and mattresses.',
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const rawResults = await searchProducts(query)
  const results = rawResults.map(toDisplayProduct)

  return <SearchPageClient query={query} results={results} />
}
