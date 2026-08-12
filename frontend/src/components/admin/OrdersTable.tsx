'use client'

import { useState } from 'react'

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

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const [viewingOrder, setViewingOrder] = useState<AdminOrderRow | null>(null)

  if (orders.length === 0) {
    return <p className="p-6 text-sm text-stone-500">No orders found.</p>
  }

  return (
    <>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-xs font-medium tracking-wide text-stone-500 uppercase">
            <th className="px-6 py-3">Order ID</th>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Total</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-stone-100 last:border-0">
              <td className="px-6 py-4 font-medium text-[#b87333]">#{order.orderNumber}</td>
              <td className="px-6 py-4 text-stone-900">
                {order.firstName} {order.lastName}
              </td>
              <td className="px-6 py-4 text-stone-500">{formatDate(order.createdAt)}</td>
              <td className="px-6 py-4 font-medium text-stone-900">{formatCurrency(order.total)}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => setViewingOrder(order)}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewingOrder && (
        <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
      )}
    </>
  )
}

function OrderDetailsModal({ order, onClose }: { order: AdminOrderRow; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">#{order.orderNumber}</h2>
            <p className="text-sm text-stone-500">{formatDate(order.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <section className="mb-4">
          <h3 className="mb-2 text-xs font-medium tracking-wide text-stone-500 uppercase">Customer</h3>
          <dl className="grid grid-cols-3 gap-y-1 text-sm">
            <dt className="text-stone-500">Name</dt>
            <dd className="col-span-2 text-stone-900">
              {order.firstName} {order.lastName}
            </dd>
            <dt className="text-stone-500">Email</dt>
            <dd className="col-span-2 text-stone-900">{order.email}</dd>
            <dt className="text-stone-500">Phone</dt>
            <dd className="col-span-2 text-stone-900">{order.phone}</dd>
            {order.companyName && (
              <>
                <dt className="text-stone-500">Company</dt>
                <dd className="col-span-2 text-stone-900">{order.companyName}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="mb-4">
          <h3 className="mb-2 text-xs font-medium tracking-wide text-stone-500 uppercase">Delivery Address</h3>
          <p className="text-sm text-stone-900">
            {order.address}
            <br />
            {order.city}, {order.county} {order.postcode}
            <br />
            {order.country}
          </p>
        </section>

        {order.orderNotes && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-medium tracking-wide text-stone-500 uppercase">Order Notes</h3>
            <p className="text-sm text-stone-900">{order.orderNotes}</p>
          </section>
        )}

        <section className="mb-4">
          <h3 className="mb-2 text-xs font-medium tracking-wide text-stone-500 uppercase">Items</h3>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-stone-900">{item.productName}</p>
                  <p className="text-stone-500">
                    {[item.sizeLabel, item.fabricName].filter(Boolean).join(' · ')}
                    {item.quantity > 1 ? ` · Qty ${item.quantity}` : ''}
                  </p>
                </div>
                <span className="font-medium text-stone-900">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-stone-200 pt-4">
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Subtotal</dt>
              <dd className="text-stone-900">{formatCurrency(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Shipping</dt>
              <dd className="text-stone-900">{formatCurrency(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt className="text-stone-900">Total</dt>
              <dd className="text-stone-900">{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
