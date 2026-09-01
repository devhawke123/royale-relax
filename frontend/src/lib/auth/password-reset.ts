import { generateOpaqueToken, hashToken } from './tokens'

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

export interface PasswordResetTokenRow {
  id: string
  tokenHash: string
  adminUserId: string
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

type NewResetTokenData = {
  tokenHash: string
  adminUserId: string
  expiresAt: Date
}

/**
 * The subset of a Prisma `passwordResetToken` delegate this module needs. Real
 * callers pass `tx.passwordResetToken` from inside `prisma.$transaction`; tests
 * pass an in-memory fake with the same shape.
 */
export interface PasswordResetTokenDelegate {
  findUnique(args: { where: { tokenHash: string } }): Promise<PasswordResetTokenRow | null>
  create(args: { data: NewResetTokenData }): Promise<PasswordResetTokenRow>
  update(args: { where: { id: string }; data: { usedAt: Date } }): Promise<PasswordResetTokenRow>
  updateMany(args: {
    where: { adminUserId: string; usedAt: null }
    data: { usedAt: Date }
  }): Promise<{ count: number }>
}

export interface IssuedResetToken {
  raw: string
  row: PasswordResetTokenRow
}

/**
 * Mint a fresh reset token for an admin. Any earlier unused tokens for the same
 * admin are invalidated first — only one reset link is ever live at a time, so a
 * second "forgot password" click can't leave two working links behind.
 */
export async function issueResetToken(
  delegate: PasswordResetTokenDelegate,
  adminUserId: string,
): Promise<IssuedResetToken> {
  await delegate.updateMany({
    where: { adminUserId, usedAt: null },
    data: { usedAt: new Date() },
  })

  const raw = generateOpaqueToken()
  const row = await delegate.create({
    data: {
      tokenHash: hashToken(raw),
      adminUserId,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  })
  return { raw, row }
}

export type RedeemResult =
  | { status: 'ok'; adminUserId: string }
  | { status: 'invalid' }

/**
 * Validate a raw reset token and consume it. Returns `invalid` (never throws)
 * for not-found / already-used / expired so the caller can commit its
 * transaction unconditionally, matching the pattern in refresh.ts.
 *
 * MUST run inside the same transaction as the password update: on success the
 * token is marked used here, and if the later password write fails the whole
 * transaction — this mark included — rolls back.
 */
export async function redeemResetToken(
  delegate: PasswordResetTokenDelegate,
  rawToken: string,
): Promise<RedeemResult> {
  const row = await delegate.findUnique({ where: { tokenHash: hashToken(rawToken) } })

  if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    return { status: 'invalid' }
  }

  await delegate.update({ where: { id: row.id }, data: { usedAt: new Date() } })
  return { status: 'ok', adminUserId: row.adminUserId }
}
