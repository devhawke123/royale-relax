import { describe, expect, it } from 'vitest'
import { hashToken } from './tokens'
import {
  issueResetToken,
  redeemResetToken,
  RESET_TOKEN_TTL_MS,
  type PasswordResetTokenDelegate,
  type PasswordResetTokenRow,
} from './password-reset'

/** In-memory stand-in for `tx.passwordResetToken`. */
function createFakeDelegate(): PasswordResetTokenDelegate & {
  rows: Map<string, PasswordResetTokenRow>
} {
  const rows = new Map<string, PasswordResetTokenRow>()
  let counter = 0

  return {
    rows,
    async findUnique({ where }) {
      for (const row of rows.values()) {
        if (row.tokenHash === where.tokenHash) return row
      }
      return null
    },
    async create({ data }) {
      const row: PasswordResetTokenRow = {
        id: `prt_${++counter}`,
        tokenHash: data.tokenHash,
        adminUserId: data.adminUserId,
        expiresAt: data.expiresAt,
        usedAt: null,
        createdAt: new Date(),
      }
      rows.set(row.id, row)
      return row
    },
    async update({ where, data }) {
      const row = rows.get(where.id)
      if (!row) throw new Error('not found')
      const updated = { ...row, ...data }
      rows.set(row.id, updated)
      return updated
    },
    async updateMany({ where, data }) {
      let count = 0
      for (const row of rows.values()) {
        if (row.adminUserId === where.adminUserId && row.usedAt === where.usedAt) {
          rows.set(row.id, { ...row, ...data })
          count++
        }
      }
      return { count }
    },
  }
}

describe('issueResetToken', () => {
  it('creates a hashed token with a ~1h expiry and returns the raw value', async () => {
    const delegate = createFakeDelegate()
    const before = Date.now()

    const { raw, row } = await issueResetToken(delegate, 'admin_1')

    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(row.tokenHash).toBe(hashToken(raw))
    expect(row.tokenHash).not.toBe(raw)
    expect(row.expiresAt.getTime()).toBeGreaterThanOrEqual(before + RESET_TOKEN_TTL_MS - 1000)
    expect(row.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + RESET_TOKEN_TTL_MS + 1000)
  })

  it('invalidates the admin\'s earlier unused tokens', async () => {
    const delegate = createFakeDelegate()
    const first = await issueResetToken(delegate, 'admin_1')
    await issueResetToken(delegate, 'admin_1')

    expect((await redeemResetToken(delegate, first.raw)).status).toBe('invalid')
  })

  it('leaves other admins\' tokens alone', async () => {
    const delegate = createFakeDelegate()
    const other = await issueResetToken(delegate, 'admin_2')
    await issueResetToken(delegate, 'admin_1')

    expect(await redeemResetToken(delegate, other.raw)).toEqual({
      status: 'ok',
      adminUserId: 'admin_2',
    })
  })
})

describe('redeemResetToken', () => {
  it('accepts a fresh token once, then rejects reuse', async () => {
    const delegate = createFakeDelegate()
    const { raw } = await issueResetToken(delegate, 'admin_1')

    expect(await redeemResetToken(delegate, raw)).toEqual({ status: 'ok', adminUserId: 'admin_1' })
    expect((await redeemResetToken(delegate, raw)).status).toBe('invalid')
  })

  it('rejects an unknown token', async () => {
    const delegate = createFakeDelegate()
    expect((await redeemResetToken(delegate, 'nope')).status).toBe('invalid')
  })

  it('rejects an expired token', async () => {
    const delegate = createFakeDelegate()
    const { raw, row } = await issueResetToken(delegate, 'admin_1')
    delegate.rows.set(row.id, { ...row, expiresAt: new Date(Date.now() - 1000) })

    expect((await redeemResetToken(delegate, raw)).status).toBe('invalid')
  })
})
