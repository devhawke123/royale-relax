import { NextResponse } from 'next/server'
import { searchProducts, toDisplayProduct } from '@/lib/products'

const SUGGESTION_LIMIT = 6

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() ?? ''

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const rawResults = await searchProducts(query)
  const results = rawResults.slice(0, SUGGESTION_LIMIT).map(toDisplayProduct)

  return NextResponse.json({ results })
}
