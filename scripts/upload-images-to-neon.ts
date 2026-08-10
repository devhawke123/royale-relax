import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const BUCKET = 'royale-relax-products'
const PUBLIC_ROOT = path.resolve(__dirname, '../frontend/public')
const RESULTS_PATH = path.resolve(__dirname, 'upload-results.json')

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

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

type UploadResult = {
  productImageId: string
  oldPath: string
  newKey: string
  status: 'success' | 'failure' | 'skipped'
  error?: string
}

async function main() {
  const images = await prisma.productImage.findMany({
    select: { id: true, path: true, product: { select: { slug: true } } },
    orderBy: { productId: 'asc' },
  })

  const results: UploadResult[] = []
  let successCount = 0
  let failureCount = 0
  let skippedCount = 0

  for (const img of images) {
    const relPath = img.path.replace(/^\/+/, '')
    const resolved = path.join(PUBLIC_ROOT, relPath)
    const filename = path.basename(resolved)
    const newKey = `products/${img.product.slug}-${filename}`

    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      results.push({
        productImageId: img.id,
        oldPath: img.path,
        newKey,
        status: 'skipped',
        error: 'local file not found',
      })
      skippedCount += 1
      console.log(`SKIP  ${img.id}  ${img.path} (local file not found)`)
      continue
    }

    const ext = path.extname(filename).toLowerCase()
    const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream'
    const body = fs.readFileSync(resolved)

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: newKey,
          Body: body,
          ContentType: contentType,
        }),
      )
      results.push({
        productImageId: img.id,
        oldPath: img.path,
        newKey,
        status: 'success',
      })
      successCount += 1
      console.log(`OK    ${img.id}  ${img.path} -> ${newKey} (${contentType})`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({
        productImageId: img.id,
        oldPath: img.path,
        newKey,
        status: 'failure',
        error: message,
      })
      failureCount += 1
      console.log(`FAIL  ${img.id}  ${img.path} -> ${newKey}: ${message}`)
    }
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))

  console.log(`\nTotal: ${images.length}  Success: ${successCount}  Failure: ${failureCount}  Skipped: ${skippedCount}`)
  console.log(`Results written to ${RESULTS_PATH}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
