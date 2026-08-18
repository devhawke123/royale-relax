import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { hashPassword } from '@/lib/auth/password'

const SETTINGS_ID = 'default'

export async function GET(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID, storeName: 'Royale Relax', email: '', phone: '' },
  })

  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  let claims
  try {
    claims = requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { storeName, email, phone, password } = (body ?? {}) as Record<string, unknown>

  if (typeof storeName !== 'string' || !storeName.trim()) {
    return NextResponse.json({ error: 'Store name is required' }, { status: 400 })
  }
  if (typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  if (typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
  }
  if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { storeName: storeName.trim(), email: email.trim(), phone: phone.trim() },
    create: { id: SETTINGS_ID, storeName: storeName.trim(), email: email.trim(), phone: phone.trim() },
  })
  revalidateTag('store-settings', { expire: 0 })

  if (password) {
    const passwordHash = await hashPassword(password)
    await prisma.adminUser.update({ where: { id: claims.sub }, data: { passwordHash } })
  }

  return NextResponse.json({ settings })
}
