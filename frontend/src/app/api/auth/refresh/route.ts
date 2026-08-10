import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken } from '@/lib/auth/tokens'
import { rotateRefreshToken, type RefreshTokenDelegate } from '@/lib/auth/refresh'
import { getRefreshCookie, setRefreshCookie, clearRefreshCookie } from '@/lib/auth/cookies'

export async function POST(request: Request) {
  const rawToken = getRefreshCookie(request)
  if (!rawToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const userAgent = request.headers.get('user-agent')

  // rotateRefreshToken never throws for reuse/invalid — it returns a status.
  // The transaction must commit unconditionally so the reuse branch's mass
  // revocation is actually persisted, not rolled back with everything else.
  const result = await prisma.$transaction(async (tx) => {
    const delegate: RefreshTokenDelegate = {
      findUnique: (args) => tx.refreshToken.findUnique(args),
      create: (args) => tx.refreshToken.create(args),
      update: (args) => tx.refreshToken.update(args),
      updateMany: (args) => tx.refreshToken.updateMany(args),
    }
    return rotateRefreshToken(delegate, rawToken, userAgent)
  })

  if (result.status === 'reuse') {
    const response = NextResponse.json(
      { error: 'Refresh token reuse detected; all sessions revoked' },
      { status: 401 },
    )
    clearRefreshCookie(response)
    return response
  }

  if (result.status === 'invalid') {
    const response = NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    clearRefreshCookie(response)
    return response
  }

  const { issued } = result
  const ownerId = issued.row.subject === 'CUSTOMER' ? issued.row.customerId : issued.row.adminUserId
  let role: string | undefined
  if (issued.row.subject === 'ADMIN' && ownerId) {
    const admin = await prisma.adminUser.findUnique({ where: { id: ownerId }, select: { role: true } })
    role = admin?.role
  }

  const accessToken = signAccessToken({
    sub: ownerId as string,
    subject: issued.row.subject === 'CUSTOMER' ? 'customer' : 'admin',
    role,
  })

  const response = NextResponse.json({
    accessToken,
    subject: issued.row.subject === 'CUSTOMER' ? 'customer' : 'admin',
  })
  setRefreshCookie(response, issued.raw, issued.row.expiresAt)
  return response
}
