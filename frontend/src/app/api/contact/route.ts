import { NextResponse } from 'next/server'
import { Resend } from 'resend'

interface ContactPayload {
  name?: string
  email?: string
  phone?: string
  message?: string
}

export async function POST(request: Request) {
  const body: ContactPayload = await request.json()
  const name = body.name?.trim()
  const email = body.email?.trim()
  const phone = body.phone?.trim()
  const message = body.message?.trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_EMAIL_TO
  const from = process.env.CONTACT_EMAIL_FROM || 'Royale Relax Contact Form <onboarding@resend.dev>'

  if (!apiKey || !to) {
    return NextResponse.json({ error: 'Contact form is not configured.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
