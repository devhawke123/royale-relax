import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { Prisma } from '../../../../../generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { hashPassword } from '@/lib/auth/password'

const SETTINGS_ID = 'default'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The Settings form mixes two unrelated things:
 *   - storeName / phone  -> StoreSettings, shown on the storefront
 *   - email / password   -> the logged-in admin's LOGIN credentials only
 * The storefront contact email is intentionally NOT editable here.
 */

export async function GET(request: Request) {
  let claims
  try {
    claims = requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const [settings, admin] = await Promise.all([
    prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID, storeName: 'Royale Relax', email: '', phone: '' },
    }),
    prisma.adminUser.findUnique({ where: { id: claims.sub }, select: { email: true } }),
  ])

  // `email` here is the admin's login email, not the storefront contact email.
  return NextResponse.json({
    settings: { ...settings, email: admin?.email ?? '' },
  })
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
    return NextResponse.json({ error: 'Login email is required' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Enter a valid login email address' }, { status: 400 })
  }
  if (typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
  }
  if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  // Login email — lower-cased to match how the login route normalises input.
  const loginEmail = email.trim().toLowerCase()

  try {
    await prisma.adminUser.update({
      where: { id: claims.sub },
      data: {
        email: loginEmail,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
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

  // Storefront-facing fields only. The contact email is left untouched.
  const settings = await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { storeName: storeName.trim(), phone: phone.trim() },
    create: { id: SETTINGS_ID, storeName: storeName.trim(), email: '', phone: phone.trim() },
  })

  // storeName / phone show in the header + footer, which live in the root
  // layout, so statically-rendered routes need revalidating too.
  revalidateTag('store-settings', { expire: 0 })
  revalidatePath('/', 'layout')

  return NextResponse.json({ settings: { ...settings, email: loginEmail } })
}
