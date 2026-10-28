/**
 * One-time migration: moves images stored as base64 `data:` URLs inside the
 * database out into real files (local public/uploads, or Neon Object Storage
 * when the AWS_* variables are set — see src/lib/storage.ts), then rewrites the
 * column to the short path/URL.
 *
 * Covers ProductImage.path, FabricColor.imagePath and OrderItem.imagePath.
 *
 * Usage (from frontend/):
 *   npx tsx scripts/migrate-base64-images.ts            # dry run, changes nothing
 *   npx tsx scripts/migrate-base64-images.ts --apply    # upload + update rows
 *
 * Safe to re-run: files are named by content hash, and only rows that still
 * start with `data:` are touched.
 */
import 'dotenv/config'
import { createHash } from 'node:crypto'
import { prisma } from '../src/lib/prisma'
import { saveImage, storageDriver } from '../src/lib/storage'

const apply = process.argv.includes('--apply')

interface Target {
  label: string
  ids: () => Promise<string[]>
  read: (id: string) => Promise<string | null>
  write: (id: string, value: string) => Promise<unknown>
}

const targets: Target[] = [
  {
    label: 'ProductImage.path',
    ids: async () =>
      (await prisma.productImage.findMany({ where: { path: { startsWith: 'data:' } }, select: { id: true } })).map((r) => r.id),
    read: async (id) => (await prisma.productImage.findUnique({ where: { id }, select: { path: true } }))?.path ?? null,
    write: (id, path) => prisma.productImage.update({ where: { id }, data: { path } }),
  },
  {
    label: 'FabricColor.imagePath',
    ids: async () =>
      (await prisma.fabricColor.findMany({ where: { imagePath: { startsWith: 'data:' } }, select: { id: true } })).map((r) => r.id),
    read: async (id) => (await prisma.fabricColor.findUnique({ where: { id }, select: { imagePath: true } }))?.imagePath ?? null,
    write: (id, imagePath) => prisma.fabricColor.update({ where: { id }, data: { imagePath } }),
  },
  {
    label: 'OrderItem.imagePath',
    ids: async () =>
      (await prisma.orderItem.findMany({ where: { imagePath: { startsWith: 'data:' } }, select: { id: true } })).map((r) => r.id),
    read: async (id) => (await prisma.orderItem.findUnique({ where: { id }, select: { imagePath: true } }))?.imagePath ?? null,
    write: (id, imagePath) => prisma.orderItem.update({ where: { id }, data: { imagePath } }),
  },
]

function decodeDataUrl(value: string): Buffer | null {
  const match = /^data:[^;,]+;base64,([\s\S]*)$/.exec(value)
  return match ? Buffer.from(match[1], 'base64') : null
}

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2)

/** For remote storage, make sure the public URL really serves the file before we point the DB at it. */
async function assertReachable(location: string) {
  if (!location.startsWith('http')) return
  const res = await fetch(location, { method: 'HEAD' })
  if (!res.ok) {
    throw new Error(`Uploaded file is not publicly readable (${res.status}) at ${location}. Aborting before touching the database.`)
  }
}

async function main() {
  const dbUrl = new URL(process.env.DATABASE_URL ?? '')
  const isLocalDb = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(dbUrl.hostname)
  if (apply && !isLocalDb && storageDriver() === 'local') {
    throw new Error(
      'Refusing to --apply to a remote database with local-disk storage: rows would point at files that only exist on this PC. ' +
        'Set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY first.',
    )
  }
  console.log(`Database: ${dbUrl.hostname}:${dbUrl.port || 3306}${dbUrl.pathname}`)
  console.log(`Storage:  ${storageDriver() === 's3' ? 'S3 / Neon Object Storage (REMOTE)' : 'local disk (public/uploads)'}`)
  console.log(apply ? 'Mode:     APPLY (will upload and update rows)\n' : 'Mode:     dry run (pass --apply to make changes)\n')

  const done = new Map<string, string>() // sha256(original bytes) -> stored location
  let rows = 0
  let dbBytes = 0
  let uploaded = 0

  for (const target of targets) {
    const ids = await target.ids()
    console.log(`${target.label}: ${ids.length} base64 row(s)`)

    for (const id of ids) {
      const value = await target.read(id)
      const bytes = value ? decodeDataUrl(value) : null
      if (!value || !bytes) {
        console.warn(`  ! ${id}: not a base64 data URL, skipped`)
        continue
      }
      rows++
      dbBytes += value.length

      const hash = createHash('sha256').update(bytes).digest('hex')
      let location = done.get(hash)
      if (!location && apply) {
        location = await saveImage(bytes)
        await assertReachable(location)
        done.set(hash, location)
        uploaded++
      }
      console.log(`  ${id}  ${mb(value.length)} MB text${apply ? ` -> ${location}` : ''}`)
      if (apply && location) await target.write(id, location)
    }
  }

  console.log(`\n${rows} row(s), ${mb(dbBytes)} MB of base64 text in the database.`)
  console.log(apply ? `Uploaded ${uploaded} unique image(s) and updated ${rows} row(s).` : 'Dry run only — nothing changed.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
