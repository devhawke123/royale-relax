import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { redeemResetToken } from '@/lib/auth/password-reset'

const MIN_PASSWORD_LENGTH = 8

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { token, password } = (body ?? {}) as Record<string, unknown>

  if (typeof token !== 'string' || !token.trim()) {
    return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 },
    )
  }

  const passwordHash = await hashPassword(password)

  const outcome = await prisma.$transaction(async (tx) => {
    const redeemed = await redeemResetToken(tx.passwordResetToken, token)
    if (redeemed.status !== 'ok') {
      return 'invalid' as const
    }

    await tx.adminUser.update({
      where: { id: redeemed.adminUserId },
      data: { passwordHash },
    })

    // A password reset invalidates every existing session for that admin.
    await tx.refreshToken.updateMany({
      where: { adminUserId: redeemed.adminUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return 'ok' as const
  })

  if (outcome === 'invalid') {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Request a new one.' },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}
