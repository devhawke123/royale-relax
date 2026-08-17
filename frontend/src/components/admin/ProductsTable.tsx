'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function ProductsTable({
  products,
  onDeleted,
}: {
  products: AdminProductRow[]
  onDeleted: (id: string) => void
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function confirmDelete(id: string, accessToken: string | null) {
    if (!accessToken) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Could not delete product')
      }
      onDeleted(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setDeletingId(null)
      setPendingDeleteId(null)
    }
  }

  if (products.length === 0) {
    return <p className="p-6 text-sm text-stone-500">No products found.</p>
  }

  return (
    <>
      {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-xs font-medium tracking-wide text-stone-500 uppercase">
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">SKU</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3">Discount</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-stone-100 last:border-0">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ProductThumbnailIcon className="h-4.5 w-4.5 text-[#b87333]" />
                    )}
                  </div>
                  <span className="font-medium text-[#b87333]">{product.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-stone-500">{product.sku ?? '—'}</td>
              <td className="px-6 py-4 font-medium text-stone-900">
                {formatCurrency(product.basePrice)}
                {product.onSale && product.salePrice !== null && (
                  <span className="ml-2 text-xs font-normal text-stone-400 line-through">
                    {formatCurrency(product.salePrice)}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-stone-700">{product.discountPercent > 0 ? `${product.discountPercent}%` : '0%'}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                    aria-label="Edit product"
                  >
                    <EditIcon className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(product.id)}
                    className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete product"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pendingDeleteId && (
        <ProductDeleteConfirm
          productName={products.find((p) => p.id === pendingDeleteId)?.name ?? ''}
          deleting={deletingId === pendingDeleteId}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={(accessToken) => confirmDelete(pendingDeleteId, accessToken)}
        />
      )}
    </>
  )
}

function ProductDeleteConfirm({
  productName,
  deleting,
  onCancel,
  onConfirm,
}: {
  productName: string
  deleting: boolean
  onCancel: () => void
  onConfirm: (accessToken: string | null) => void
}) {
  const { accessToken } = useAuth()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-stone-900">Delete product?</h2>
        <p className="mt-2 text-sm text-stone-500">
          This will remove <span className="font-medium text-stone-700">{productName}</span> from the catalog. This
          action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(accessToken)}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductThumbnailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 15.5V6a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v9.5M2.5 15.5v-2.75h15v2.75M2.5 12.75V9.75a1 1 0 0 1 1-1H9v3M17.5 12.75V9.75a1 1 0 0 0-1-1H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M13.5 3.5 16.5 6.5 7 16H4v-3L13.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4 5.5h12M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M6 5.5V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5.5M8.5 9v4.5M11.5 9v4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
