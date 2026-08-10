import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { S3Client, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const BUCKET = 'royale-relax-products'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
})

// frontend public dir root — ProductImage.path values are expected to be
// web paths like /images/Products/... resolved relative to frontend/public
const PUBLIC_ROOT = path.resolve(__dirname, '../frontend/public')

async function main() {
  const images = await prisma.productImage.findMany({
    select: { id: true, productId: true, path: true, isMain: true },
    orderBy: { productId: 'asc' },
  })

  console.log(`Total ProductImage rows: ${images.length}`)

  const missing: { id: string; productId: string; path: string; resolved: string }[] = []
  const found: { id: string; productId: string; path: string; resolved: string; size: number; ext: string }[] = []

  for (const img of images) {
    // strip leading slash, resolve against public root
    const relPath = img.path.replace(/^\/+/, '')
    const resolved = path.join(PUBLIC_ROOT, relPath)
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      const stat = fs.statSync(resolved)
      found.push({
        id: img.id,
        productId: img.productId,
        path: img.path,
        resolved,
        size: stat.size,
        ext: path.extname(resolved).toLowerCase(),
      })
    } else {
      missing.push({ id: img.id, productId: img.productId, path: img.path, resolved })
    }
  }

  console.log(`\nResolved to a real file on disk: ${found.length}`)
  console.log(`MISSING (path does not resolve to a file): ${missing.length}`)

  if (missing.length > 0) {
    console.log('\n--- Missing files ---')
    for (const m of missing) {
      console.log(`  id=${m.id} productId=${m.productId} path="${m.path}" -> tried: ${m.resolved}`)
    }
  }

  // format/size breakdown
  const byExt: Record<string, { count: number; totalBytes: number }> = {}
  for (const f of found) {
    byExt[f.ext] ??= { count: 0, totalBytes: 0 }
    byExt[f.ext].count += 1
    byExt[f.ext].totalBytes += f.size
  }
  console.log('\n--- File format / size breakdown (found files only) ---')
  for (const [ext, info] of Object.entries(byExt)) {
    const avgKb = (info.totalBytes / info.count / 1024).toFixed(1)
    const totalMb = (info.totalBytes / 1024 / 1024).toFixed(2)
    console.log(`  ${ext || '(no ext)'}: count=${info.count} avg=${avgKb}KB total=${totalMb}MB`)
  }
  const totalBytes = found.reduce((a, f) => a + f.size, 0)
  console.log(`  TOTAL: ${found.length} files, ${(totalBytes / 1024 / 1024).toFixed(2)}MB`)

  // bucket reachability check
  console.log(`\n--- Bucket check: ${BUCKET} ---`)
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
    console.log(`  HeadBucket OK — bucket "${BUCKET}" exists and is reachable.`)
  } catch (err) {
    console.log(`  HeadBucket FAILED: ${(err as Error).message}`)
  }
  try {
    const list = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 10 }))
    console.log(`  ListObjectsV2 OK — KeyCount=${list.KeyCount ?? 0} (showing up to 10):`)
    for (const obj of list.Contents ?? []) {
      console.log(`    ${obj.Key} (${obj.Size} bytes)`)
    }
  } catch (err) {
    console.log(`  ListObjectsV2 FAILED: ${(err as Error).message}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
