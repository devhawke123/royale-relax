import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'

export async function GET(request: Request) {
  let claims
  try {
    claims = requireAuth(request, { subject: 'customer' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const orders = await prisma.order.findMany({
    where: { customerId: claims.sub },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { addons: true } } },
  })

  return NextResponse.json({ orders })
}
