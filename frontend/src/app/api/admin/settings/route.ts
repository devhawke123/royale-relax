import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { Prisma } from '../../../../../generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { hashPassword } from '@/lib/auth/password'

const SETTINGS_ID = 'default'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }
  if (typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
  }
  if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const displayEmail = email.trim()
  // The admin signs in with this same address, and login lower-cases the input,
  // so the stored login email must be lower-case to match.
  const loginEmail = displayEmail.toLowerCase()

  // Keep the admin's login email in sync with the store contact email. Do this
  // first so a collision with another admin account aborts before anything else
  // is written.
  try {
    await prisma.adminUser.update({
      where: { id: claims.sub },
      data: { email: loginEmail },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'That email is already used by another admin account.' },
        { status: 409 },
      )
    }
    throw err
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { storeName: storeName.trim(), email: displayEmail, phone: phone.trim() },
    create: { id: SETTINGS_ID, storeName: storeName.trim(), email: displayEmail, phone: phone.trim() },
  })

  if (password) {
    const passwordHash = await hashPassword(password)
    await prisma.adminUser.update({ where: { id: claims.sub }, data: { passwordHash } })
  }

  // Refresh the cached store settings AND the statically-rendered routes that
  // show the header/footer contact details, so the change appears on the
  // storefront right away.
  revalidateTag('store-settings', { expire: 0 })
  revalidatePath('/', 'layout')

  return NextResponse.json({ settings })
}
