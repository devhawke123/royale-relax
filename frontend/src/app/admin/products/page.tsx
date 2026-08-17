'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProductsTable } from '@/components/admin/ProductsTable'

interface AdminProductRow {
  id: string
  name: string
  sku: string | null
  image: string | null
  basePrice: number
  salePrice: number | null
  onSale: boolean
  discountPercent: number
}

interface ProductsResponse {
  products: AdminProductRow[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

const PAGE_SIZE = 25

const CATEGORY_OPTIONS = ['BEDS', 'MATTRESSES', 'FABRICS'] as const
const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export default function AdminProductsPage() {
  const { accessToken } = useAuth()
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [error, setError] = useState('')

  const activeFilterCount = (category ? 1 : 0) + (status ? 1 : 0)

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    const handle = setTimeout(() => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (search.trim()) params.set('search', search.trim())
      if (category) params.set('category', category)
      if (status) params.set('status', status)

      fetch(`/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to load products')
          return res.json()
        })
        .then((json) => {
          if (!cancelled) setData(json)
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
        })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [accessToken, page, search, category, status])

  function handleDeleted(id: string) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            products: prev.products.filter((p) => p.id !== id),
            pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
          }
        : prev,
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">Products</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-xl border border-stone-200 bg-white">
        <div className="flex items-center gap-3 border-b border-stone-200 p-4">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="h-11 w-full rounded-lg border border-stone-300 pl-9 pr-3 text-sm outline-none focus:border-[#b87333]"
            />
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex h-11 items-center gap-2 rounded-lg border border-stone-300 px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              <FilterIcon className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b87333] px-1 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-stone-200 bg-white p-4 shadow-lg">
                  <label className="flex flex-col gap-1.5 text-sm text-stone-700">
                    Category
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value)
                        setPage(1)
                      }}
                      className="h-10 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                    >
                      <option value="">All Categories</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {formatEnumLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-4 flex flex-col gap-1.5 text-sm text-stone-700">
                    Status
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value)
                        setPage(1)
                      }}
                      className="h-10 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#b87333]"
                    >
                      <option value="">All Statuses</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {formatEnumLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('')
                        setStatus('')
                        setPage(1)
                      }}
                      className="mt-4 w-full rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <Link
            href="/admin/products/new"
            className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#b87333] px-4 text-sm font-medium text-white transition-colors hover:bg-[#a3662e]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {!data ? (
          <p className="p-6 text-sm text-stone-500">Loading…</p>
        ) : (
          <>
            <ProductsTable products={data.products} onDeleted={handleDeleted} />
            <div className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-sm text-stone-500">
              <span>
                Showing {data.pagination.total === 0 ? 0 : (data.pagination.page - 1) * data.pagination.pageSize + 1}–
                {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of{' '}
                {data.pagination.total} products
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.pagination.page <= 1}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M3 5h14M6 10h8M8.5 15h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
