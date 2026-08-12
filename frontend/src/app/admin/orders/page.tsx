'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { OrdersTable } from '@/components/admin/OrdersTable'

interface AdminOrderItem {
  id: string
  productName: string
  sizeLabel: string | null
  fabricName: string | null
  quantity: number
  unitPrice: string
  lineTotal: string
}

interface AdminOrderRow {
  id: string
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string | null
  country: string
  address: string
  city: string
  county: string
  postcode: string
  orderNotes: string | null
  createdAt: string
  subtotal: string
  shippingFee: string
  total: string
  status: string
  paymentStatus: string
  items: AdminOrderItem[]
}

interface OrdersResponse {
  orders: AdminOrderRow[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

const PAGE_SIZE = 25

export default function AdminOrdersPage() {
  const { accessToken } = useAuth()
  const [data, setData] = useState<OrdersResponse | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    fetch(`/api/admin/orders?page=${page}&pageSize=${PAGE_SIZE}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load orders')
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, page])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">Orders</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        {!data ? (
          <p className="p-6 text-sm text-stone-500">Loading…</p>
        ) : (
          <>
            <OrdersTable orders={data.orders} />
            <div className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-sm text-stone-500">
              <span>
                Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1}–
                {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of{' '}
                {data.pagination.total} orders
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
