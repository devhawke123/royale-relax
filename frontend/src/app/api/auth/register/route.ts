import { NextResponse } from 'next/server'
import { Prisma } from '../../../../../generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password, firstName, lastName } = (body ?? {}) as Record<string, unknown>

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }
  if (typeof firstName !== 'string' || !firstName.trim()) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  }
  if (typeof lastName !== 'string' || !lastName.trim()) {
    return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  try {
    const customer = await prisma.customer.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    })
    return NextResponse.json({ customer }, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    throw err
  }
}
