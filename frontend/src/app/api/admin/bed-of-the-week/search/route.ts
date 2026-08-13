import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { searchBedProducts } from '@/lib/bed-of-the-week'

export async function GET(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() ?? ''

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const results = await searchBedProducts(query)
  return NextResponse.json({ results })
}
