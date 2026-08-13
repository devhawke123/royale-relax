import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { PaymentStatus } from '../../../../../../generated/prisma/enums'

const SERIES_DAYS = 30

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function startOfMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

/**
 * Aggregates in JS rather than a SQL GROUP BY — fine at this order volume.
 * If order volume grows large enough for this to matter, replace with a
 * `GROUP BY date_trunc('day', "createdAt")` raw query or a nightly rollup
 * table; the response shape here would stay the same.
 */
export async function GET(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const now = new Date()
  const seriesStart = new Date(now)
  seriesStart.setUTCDate(seriesStart.getUTCDate() - (SERIES_DAYS - 1))
  seriesStart.setUTCHours(0, 0, 0, 0)
  const monthStart = startOfMonth(now)

  const [
    totalRevenueAgg,
    totalOrders,
    totalCustomers,
    monthRevenueAgg,
    ordersThisMonth,
    paidOrdersInSeries,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID, createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.findMany({
      where: { paymentStatus: PaymentStatus.PAID, createdAt: { gte: seriesStart } },
      select: { createdAt: true, total: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, orderNumber: true, firstName: true, lastName: true },
    }),
  ])

  const byDay = new Map<string, number>()
  for (const order of paidOrdersInSeries) {
    const key = dayKey(order.createdAt)
    byDay.set(key, (byDay.get(key) ?? 0) + Number(order.total))
  }

  const revenueSeries: { date: string; revenue: number }[] = []
  for (let i = 0; i < SERIES_DAYS; i++) {
    const d = new Date(seriesStart)
    d.setUTCDate(d.getUTCDate() + i)
    const key = dayKey(d)
    revenueSeries.push({ date: key, revenue: byDay.get(key) ?? 0 })
  }

  return NextResponse.json({
    totalRevenue: Number(totalRevenueAgg._sum.total ?? 0),
    totalOrders,
    totalCustomers,
    revenueThisMonth: Number(monthRevenueAgg._sum.total ?? 0),
    ordersThisMonth,
    revenueSeries,
    recentOrders,
  })
}
