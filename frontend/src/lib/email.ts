import { Resend } from 'resend'

const FROM = process.env.CONTACT_EMAIL_FROM || 'Royale Relax <onboarding@resend.dev>'

/**
 * Sends the admin password-reset link. Throws if Resend isn't configured or the
 * send fails — the caller decides whether that should surface to the user.
 */
export async function sendAdminPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Royale Relax admin password',
    text: [
      'A password reset was requested for your Royale Relax admin account.',
      '',
      `Reset your password: ${resetUrl}`,
      '',
      'This link expires in 1 hour and can only be used once.',
      "If you didn't request this, you can ignore this email — your password stays unchanged.",
    ].join('\n'),
  })

  if (error) {
    throw new Error(`Resend failed: ${error.message}`)
  }
}
