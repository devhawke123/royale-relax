import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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

  const user = process.env.CONTACT_EMAIL_USER
  const pass = process.env.CONTACT_EMAIL_PASS
  const to = process.env.CONTACT_EMAIL_TO ?? user

  if (!user || !pass) {
    return NextResponse.json({ error: 'Contact form is not configured.' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  try {
    await transporter.sendMail({
      from: `"Royale Relax Contact Form" <${user}>`,
      to,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
