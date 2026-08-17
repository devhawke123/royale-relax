import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const { id } = await params
  const existing = await prisma.order.findUnique({ where: { id }, select: { id: true } })
  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Items/addons cascade-delete with the order (schema onDelete: Cascade).
  await prisma.order.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
