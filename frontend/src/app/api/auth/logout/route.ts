import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/auth/tokens'
import { getRefreshCookie, clearRefreshCookie } from '@/lib/auth/cookies'

export async function POST(request: Request) {
  const rawToken = getRefreshCookie(request)

  if (rawToken) {
    const tokenHash = hashToken(rawToken)
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  const response = NextResponse.json({ ok: true })
  clearRefreshCookie(response)
  return response
}
