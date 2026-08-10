import { describe, expect, it } from 'vitest'
import { hashToken } from './tokens'
import {
  issueRefreshToken,
  rotateRefreshToken,
  type RefreshTokenDelegate,
  type RefreshTokenRow,
} from './refresh'

/**
 * In-memory stand-in for `tx.refreshToken`, implementing exactly the
 * subset of the Prisma delegate `refresh.ts` depends on. Lets the rotation
 * / reuse-detection logic be exercised without a live database.
 */
function createFakeDelegate(): RefreshTokenDelegate & { rows: Map<string, RefreshTokenRow> } {
  const rows = new Map<string, RefreshTokenRow>()
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
      const row: RefreshTokenRow = {
        id: `rt_${++counter}`,
        tokenHash: data.tokenHash,
        subject: data.subject,
        customerId: data.customerId,
        adminUserId: data.adminUserId,
        expiresAt: data.expiresAt,
        revokedAt: null,
        replacedById: null,
        userAgent: data.userAgent,
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
        const ownerMatches =
          ('customerId' in where && row.customerId === where.customerId) ||
          ('adminUserId' in where && row.adminUserId === where.adminUserId)
        if (ownerMatches && row.revokedAt === where.revokedAt) {
          rows.set(row.id, { ...row, ...data })
          count++
        }
      }
      return { count }
    },
  }
}

describe('rotateRefreshToken', () => {
  it('rotates a valid token: old is revoked with replacedById, new is usable', async () => {
    const delegate = createFakeDelegate()
    const issued = await issueRefreshToken(delegate, 'CUSTOMER', 'cust-1')

    const result = await rotateRefreshToken(delegate, issued.raw)
    if (result.status !== 'ok') throw new Error(`expected ok, got ${result.status}`)

    const oldRow = delegate.rows.get(issued.row.id)!
    expect(oldRow.revokedAt).not.toBeNull()
    expect(oldRow.replacedById).toBe(result.issued.row.id)
    expect(result.issued.row.revokedAt).toBeNull()
    expect(result.issued.row.customerId).toBe('cust-1')
    expect(result.issued.raw).not.toBe(issued.raw)
  })

  it('rejects an unknown token', async () => {
    const delegate = createFakeDelegate()
    const result = await rotateRefreshToken(delegate, 'not-a-real-token')
    expect(result.status).toBe('invalid')
  })

  it('rejects an expired token', async () => {
    const delegate = createFakeDelegate()
    const issued = await issueRefreshToken(delegate, 'CUSTOMER', 'cust-1')
    const row = delegate.rows.get(issued.row.id)!
    delegate.rows.set(row.id, { ...row, expiresAt: new Date(Date.now() - 1000) })

    const result = await rotateRefreshToken(delegate, issued.raw)
    expect(result.status).toBe('invalid')
  })

  it('REUSE DETECTION: presenting an already-rotated token revokes every token for that subject', async () => {
    const delegate = createFakeDelegate()
    const original = await issueRefreshToken(delegate, 'CUSTOMER', 'cust-1')

    // Legitimate rotation: original -> gen2.
    const rotated = await rotateRefreshToken(delegate, original.raw)
    if (rotated.status !== 'ok') throw new Error('expected first rotation to succeed')
    const gen2 = rotated.issued

    // A second, unrelated active session for the same customer.
    const otherSession = await issueRefreshToken(delegate, 'CUSTOMER', 'cust-1')

    // Someone replays the original (now-revoked) token — this is theft, not a race.
    const reuseResult = await rotateRefreshToken(delegate, original.raw)
    expect(reuseResult.status).toBe('reuse')

    // Every token belonging to cust-1 must now be revoked — not just the replayed one.
    const gen2Row = delegate.rows.get(gen2.row.id)!
    const otherRow = delegate.rows.get(otherSession.row.id)!
    expect(gen2Row.revokedAt).not.toBeNull()
    expect(otherRow.revokedAt).not.toBeNull()

    // The now-revoked gen2 can no longer be rotated either.
    const gen2ReuseResult = await rotateRefreshToken(delegate, gen2.raw)
    expect(gen2ReuseResult.status).toBe('reuse')
  })

  it('reuse detection scopes revocation to the affected subject only, not other customers', async () => {
    const delegate = createFakeDelegate()
    const custA = await issueRefreshToken(delegate, 'CUSTOMER', 'cust-A')
    const custB = await issueRefreshToken(delegate, 'CUSTOMER', 'cust-B')
    const rotatedA = await rotateRefreshToken(delegate, custA.raw)
    if (rotatedA.status !== 'ok') throw new Error('expected first rotation to succeed')

    const reuseResult = await rotateRefreshToken(delegate, custA.raw)
    expect(reuseResult.status).toBe('reuse')

    const custBRow = delegate.rows.get(custB.row.id)!
    expect(custBRow.revokedAt).toBeNull()
    // cust-A's replacement was revoked, but cust-B is untouched.
    const gen2ARow = delegate.rows.get(rotatedA.issued.row.id)!
    expect(gen2ARow.revokedAt).not.toBeNull()
  })

  it('the hashed token, not the raw token, is what gets stored', async () => {
    const delegate = createFakeDelegate()
    const issued = await issueRefreshToken(delegate, 'CUSTOMER', 'cust-1')
    const row = delegate.rows.get(issued.row.id)!
    expect(row.tokenHash).toBe(hashToken(issued.raw))
    expect(row.tokenHash).not.toBe(issued.raw)
  })
})
