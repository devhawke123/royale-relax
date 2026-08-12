'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { MetricCard } from '@/components/admin/MetricCard'
import { RevenueChart } from '@/components/admin/RevenueChart'

interface Overview {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  revenueThisMonth: number
  ordersThisMonth: number
  revenueSeries: { date: string; revenue: number }[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuth()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    fetch('/api/admin/overview', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load dashboard data')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setOverview(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!overview ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total Revenue" value={formatCurrency(overview.totalRevenue)} />
            <MetricCard label="Total Orders" value={overview.totalOrders.toLocaleString()} />
            <MetricCard label="Revenue This Month" value={formatCurrency(overview.revenueThisMonth)} />
            <MetricCard label="Orders This Month" value={overview.ordersThisMonth.toLocaleString()} />
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-stone-900">Revenue Overview — Last 30 Days</h2>
            <RevenueChart data={overview.revenueSeries} />
          </div>
        </>
      )}
    </div>
  )
}
