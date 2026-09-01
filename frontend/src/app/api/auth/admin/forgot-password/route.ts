import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { issueResetToken } from '@/lib/auth/password-reset'
import { sendAdminPasswordResetEmail } from '@/lib/email'
import { getSiteUrl } from '@/lib/site-url'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Ignore repeat requests for the same admin within this window — cheap brake on
// someone hammering the endpoint to spam an inbox.
const MIN_RESEND_INTERVAL_MS = 60 * 1000

/**
 * Always responds `{ ok: true }` with 200 regardless of whether the email maps
 * to an admin — no account enumeration. Errors (missing Resend config, send
 * failure) are logged server-side and swallowed for the same reason.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email } = (body ?? {}) as Record<string, unknown>
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const ok = () => NextResponse.json({ ok: true })

  const admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } })
  if (!admin || !admin.isActive) {
    return ok()
  }

  const recent = await prisma.passwordResetToken.findFirst({
    where: { adminUserId: admin.id, createdAt: { gt: new Date(Date.now() - MIN_RESEND_INTERVAL_MS) } },
    select: { id: true },
  })
  if (recent) {
    return ok()
  }

  try {
    const { raw } = await prisma.$transaction((tx) =>
      issueResetToken(tx.passwordResetToken, admin.id),
    )
    const resetUrl = `${getSiteUrl(request)}/reset-password?token=${encodeURIComponent(raw)}`

    if (process.env.NODE_ENV !== 'production') {
      console.info(`[admin forgot-password] reset link for ${admin.email}: ${resetUrl}`)
    }

    await sendAdminPasswordResetEmail(admin.email, resetUrl)
  } catch (err) {
    console.error('[admin forgot-password] failed to send reset email:', err)
  }

  return ok()
}
