import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { OrderStatus, PaymentStatus } from '../../../../../../generated/prisma/enums'

const MAX_PAGE_SIZE = 100
const DEFAULT_PAGE_SIZE = 25

/**
 * Minimal admin listing — full admin dashboard (sorting UI, saved filters,
 * etc.) is a later phase. Supports the filters an admin needs on day one:
 * status, paymentStatus, an email substring search, and pagination.
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

  const url = new URL(request.url)
  const statusParam = url.searchParams.get('status')
  const paymentStatusParam = url.searchParams.get('paymentStatus')
  const email = url.searchParams.get('email')
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE))

  if (statusParam && !(Object.values(OrderStatus) as string[]).includes(statusParam)) {
    return NextResponse.json({ error: `Invalid status: ${statusParam}` }, { status: 400 })
  }
  if (paymentStatusParam && !(Object.values(PaymentStatus) as string[]).includes(paymentStatusParam)) {
    return NextResponse.json({ error: `Invalid paymentStatus: ${paymentStatusParam}` }, { status: 400 })
  }

  const where = {
    ...(statusParam ? { status: statusParam as OrderStatus } : {}),
    ...(paymentStatusParam ? { paymentStatus: paymentStatusParam as PaymentStatus } : {}),
    ...(email ? { email: { contains: email, mode: 'insensitive' as const } } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({
    orders,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}
