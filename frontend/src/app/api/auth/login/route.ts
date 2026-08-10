import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { signAccessToken } from '@/lib/auth/tokens'
import { issueRefreshToken, type RefreshTokenDelegate } from '@/lib/auth/refresh'
import { setRefreshCookie } from '@/lib/auth/cookies'

type RequestedSubject = 'customer' | 'admin'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password, subject } = (body ?? {}) as Record<string, unknown>

  if (typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }
  if (subject !== undefined && subject !== 'customer' && subject !== 'admin') {
    return NextResponse.json({ error: 'subject must be "customer" or "admin"' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const requestedSubject = subject as RequestedSubject | undefined

  const invalidCredentials = () =>
    NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  let resolvedSubject: RequestedSubject
  let accountId: string
  let passwordHash: string
  let isActive: boolean
  let role: string | undefined

  if (requestedSubject !== 'admin') {
    const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
    if (customer) {
      resolvedSubject = 'customer'
      accountId = customer.id
      passwordHash = customer.passwordHash
      isActive = customer.isActive
    } else if (requestedSubject === 'customer') {
      return invalidCredentials()
    } else {
      const admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } })
      if (!admin) return invalidCredentials()
      resolvedSubject = 'admin'
      accountId = admin.id
      passwordHash = admin.passwordHash
      isActive = admin.isActive
      role = admin.role
    }
  } else {
    const admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } })
    if (!admin) return invalidCredentials()
    resolvedSubject = 'admin'
    accountId = admin.id
    passwordHash = admin.passwordHash
    isActive = admin.isActive
    role = admin.role
  }

  if (!isActive) {
    return NextResponse.json({ error: 'Account is disabled' }, { status: 403 })
  }

  const passwordValid = await verifyPassword(password, passwordHash)
  if (!passwordValid) {
    return invalidCredentials()
  }

  const userAgent = request.headers.get('user-agent')

  const { accessToken, rawRefreshToken, refreshExpiresAt } = await prisma.$transaction(async (tx) => {
    const delegate: RefreshTokenDelegate = {
      findUnique: (args) => tx.refreshToken.findUnique(args),
      create: (args) => tx.refreshToken.create(args),
      update: (args) => tx.refreshToken.update(args),
      updateMany: (args) => tx.refreshToken.updateMany(args),
    }

    const issued = await issueRefreshToken(
      delegate,
      resolvedSubject === 'customer' ? 'CUSTOMER' : 'ADMIN',
      accountId,
      userAgent,
    )

    if (resolvedSubject === 'customer') {
      await tx.customer.update({ where: { id: accountId }, data: { lastLoginAt: new Date() } })
    } else {
      await tx.adminUser.update({ where: { id: accountId }, data: { lastLoginAt: new Date() } })
    }

    const accessToken = signAccessToken({ sub: accountId, subject: resolvedSubject, role })

    return { accessToken, rawRefreshToken: issued.raw, refreshExpiresAt: issued.row.expiresAt }
  })

  const response = NextResponse.json({ accessToken, subject: resolvedSubject })
  setRefreshCookie(response, rawRefreshToken, refreshExpiresAt)
  return response
}
