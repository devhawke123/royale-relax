import { generateRefreshToken, hashToken } from './tokens'

export type RefreshSubject = 'CUSTOMER' | 'ADMIN'

export interface RefreshTokenRow {
  id: string
  tokenHash: string
  subject: RefreshSubject
  customerId: string | null
  adminUserId: string | null
  expiresAt: Date
  revokedAt: Date | null
  replacedById: string | null
  userAgent: string | null
  createdAt: Date
}

type NewRefreshTokenData = {
  tokenHash: string
  subject: RefreshSubject
  customerId: string | null
  adminUserId: string | null
  expiresAt: Date
  userAgent: string | null
}

/**
 * The subset of a Prisma `refreshToken` delegate this module needs.
 * Real callers pass `tx.refreshToken` from inside a `prisma.$transaction`;
 * tests pass an in-memory fake implementing the same shape.
 */
export interface RefreshTokenDelegate {
  findUnique(args: { where: { tokenHash: string } }): Promise<RefreshTokenRow | null>
  create(args: { data: NewRefreshTokenData }): Promise<RefreshTokenRow>
  update(args: {
    where: { id: string }
    data: { revokedAt?: Date; replacedById?: string }
  }): Promise<RefreshTokenRow>
  updateMany(args: {
    where: { customerId?: string; adminUserId?: string; revokedAt: null }
    data: { revokedAt: Date }
  }): Promise<{ count: number }>
}

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface IssuedRefreshToken {
  raw: string
  row: RefreshTokenRow
}

/**
 * rotateRefreshToken never throws for an expected auth outcome — it returns
 * a result instead. This matters because the reuse branch WRITES (it mass-
 * revokes every token for the subject), and that write must run inside the
 * same DB transaction as the lookup to stay atomic. A transaction rolls back
 * everything it did the moment its callback throws, so if reuse detection
 * threw from inside `prisma.$transaction(...)`, the mass-revocation itself
 * would be undone right along with it — the exact bug this shape avoids.
 * Callers commit the transaction unconditionally, then branch on `status`.
 */
export type RotateResult =
  | { status: 'ok'; issued: IssuedRefreshToken }
  | { status: 'reuse' }
  | { status: 'invalid'; reason: string }

export async function issueRefreshToken(
  delegate: RefreshTokenDelegate,
  subject: RefreshSubject,
  ownerId: string,
  userAgent: string | null = null,
): Promise<IssuedRefreshToken> {
  const raw = generateRefreshToken()
  const row = await delegate.create({
    data: {
      tokenHash: hashToken(raw),
      subject,
      customerId: subject === 'CUSTOMER' ? ownerId : null,
      adminUserId: subject === 'ADMIN' ? ownerId : null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userAgent,
    },
  })
  return { raw, row }
}

/**
 * Rotate a refresh token on use. Looks it up by hash; if it's already
 * revoked, that presentation is reuse (a leaked token used after the
 * legitimate rotation, or a race) — every refresh token belonging to that
 * subject is revoked and { status: 'reuse' } is returned, not just this one
 * request rejected. Otherwise the old token is revoked (with
 * replacedById pointing at the new one) and a fresh pair is issued.
 *
 * Callers MUST run this inside a transaction (findUnique + writes need to be
 * atomic, or two concurrent refreshes on the same token could both "win"),
 * and MUST commit that transaction regardless of the returned status — see
 * the RotateResult doc comment for why this doesn't throw.
 */
export async function rotateRefreshToken(
  delegate: RefreshTokenDelegate,
  rawToken: string,
  userAgent: string | null = null,
): Promise<RotateResult> {
  const tokenHash = hashToken(rawToken)
  const existing = await delegate.findUnique({ where: { tokenHash } })

  if (!existing) {
    return { status: 'invalid', reason: 'Refresh token not found' }
  }

  if (existing.revokedAt) {
    await revokeAllForSubject(delegate, existing)
    return { status: 'reuse' }
  }

  if (existing.expiresAt.getTime() <= Date.now()) {
    return { status: 'invalid', reason: 'Refresh token expired' }
  }

  const ownerId = existing.subject === 'CUSTOMER' ? existing.customerId : existing.adminUserId
  if (!ownerId) {
    return { status: 'invalid', reason: 'Refresh token missing owner' }
  }

  const issued = await issueRefreshToken(delegate, existing.subject, ownerId, userAgent)

  await delegate.update({
    where: { id: existing.id },
    data: { revokedAt: new Date(), replacedById: issued.row.id },
  })

  return { status: 'ok', issued }
}

async function revokeAllForSubject(delegate: RefreshTokenDelegate, row: RefreshTokenRow): Promise<void> {
  const where =
    row.subject === 'CUSTOMER'
      ? { customerId: row.customerId as string, revokedAt: null as null }
      : { adminUserId: row.adminUserId as string, revokedAt: null as null }
  await delegate.updateMany({ where, data: { revokedAt: new Date() } })
}
