'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getImageUrl } from '@/lib/media'

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  createdAt: string
}

interface OrderItem {
  id: string
  productName: string
  sizeLabel: string | null
  fabricName: string | null
  imagePath: string | null
  quantity: number
  lineTotal: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: string
  createdAt: string
  items: OrderItem[]
}

function formatPrice(amount: string | number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function AccountPageClient() {
  const router = useRouter()
  const { status, subject, accessToken, logout } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/login')
    } else if (status === 'authenticated' && subject === 'admin') {
      router.replace('/admin')
    }
  }, [status, subject, router])

  useEffect(() => {
    if (status !== 'authenticated' || subject !== 'customer' || !accessToken) return
    let cancelled = false
    const headers = { Authorization: `Bearer ${accessToken}` }

    Promise.all([
      fetch('/api/customers/me', { headers }).then((res) => {
        if (!res.ok) throw new Error('Failed to load account')
        return res.json()
      }),
      fetch('/api/customers/me/orders', { headers }).then((res) => {
        if (!res.ok) throw new Error('Failed to load orders')
        return res.json()
      }),
    ])
      .then(([customerData, ordersData]) => {
        if (cancelled) return
        setCustomer(customerData.customer)
        setOrders(ordersData.orders)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      })

    return () => {
      cancelled = true
    }
  }, [status, subject, accessToken])

  if (status === 'loading' || status === 'guest' || (status === 'authenticated' && subject === 'admin')) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-stone-400">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-medium text-black">My Account</h1>
          <p className="text-[15px] text-[#6a6d70]">
            {customer ? `Welcome back, ${customer.firstName}.` : 'Your profile and order history.'}
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Profile */}
        <section className="rounded-2xl border border-stone-200 p-6">
          {!customer ? (
            <p className="text-sm text-stone-400">Loading profile…</p>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs tracking-wide text-stone-400 uppercase">Name</p>
                  <p className="text-[15px] text-black">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-wide text-stone-400 uppercase">Email</p>
                  <p className="text-[15px] text-black">{customer.email}</p>
                </div>
                <div>
                  <p className="text-xs tracking-wide text-stone-400 uppercase">Phone</p>
                  <p className="text-[15px] text-black">{customer.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs tracking-wide text-stone-400 uppercase">Member since</p>
                  <p className="text-[15px] text-black">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  router.push('/login')
                }}
                className="self-start rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:text-black sm:self-center"
              >
                Log out
              </button>
            </div>
          )}
        </section>

        {/* Order history */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-medium text-black">Order History</h2>

          {orders === null ? (
            <p className="text-sm text-stone-400">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-stone-300 p-8">
              <p className="text-sm text-stone-500">You haven&apos;t placed any orders yet.</p>
              <Link
                href="/shop/beds"
                className="rounded-full bg-[#b87333] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a3662e]"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-stone-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                    <div>
                      <p className="text-[15px] font-medium text-black">#{order.orderNumber}</p>
                      <p className="text-xs text-stone-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className="text-[15px] font-bold text-black">{formatPrice(order.total)}</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                          {item.imagePath && (
                            <Image
                              src={getImageUrl(item.imagePath)}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-black">{item.productName}</p>
                          <p className="text-xs text-stone-400">
                            {[item.sizeLabel, item.fabricName].filter(Boolean).join(' · ') ||
                              `Qty ${item.quantity}`}
                          </p>
                        </div>
                        <span className="text-sm text-stone-600">{formatPrice(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
