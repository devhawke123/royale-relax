import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const BUCKET = 'royale-relax-products'
const RESULTS_PATH = path.resolve(__dirname, 'upload-results.json')

// AWS_ENDPOINT_URL_S3 is the path-style Neon Object Storage endpoint;
// public objects are served at <endpoint>/<bucket>/<key>
const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3!

type UploadResult = {
  productImageId: string
  oldPath: string
  newKey: string
  status: 'success' | 'failure' | 'skipped'
  error?: string
}

// optional CLI arg: limit update to a single productId, for a small first batch
const onlyProductId = process.argv[2]

async function main() {
  const raw = fs.readFileSync(RESULTS_PATH, 'utf-8')
  const results: UploadResult[] = JSON.parse(raw)

  const successRows = results.filter((r) => r.status === 'success')
  const skippedRows = results.filter((r) => r.status !== 'success')

  let updated = 0
  let skipped = 0
  const skipReasons: Record<string, number> = {}

  for (const r of skippedRows) {
    skipReasons[r.status] = (skipReasons[r.status] ?? 0) + 1
  }

  for (const r of successRows) {
    if (onlyProductId) {
      const img = await prisma.productImage.findUnique({
        where: { id: r.productImageId },
        select: { productId: true },
      })
      if (!img || img.productId !== onlyProductId) {
        skipped += 1
        skipReasons['not-in-batch'] = (skipReasons['not-in-batch'] ?? 0) + 1
        continue
      }
    }

    const newUrl = `${ENDPOINT}/${BUCKET}/${r.newKey}`
    await prisma.productImage.update({
      where: { id: r.productImageId },
      data: { path: newUrl },
    })
    updated += 1
    console.log(`UPDATED  ${r.productImageId}  ${r.oldPath} -> ${newUrl}`)
  }

  console.log(`\nUpdated: ${updated}`)
  console.log(`Skipped: ${skipped + skippedRows.length}`)
  for (const [reason, count] of Object.entries(skipReasons)) {
    console.log(`  ${reason}: ${count}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
