/**
 * Seed script: sets basePrice for the mattress products shown on the
 * Mattresses listing page (Figma node 1:15054).
 *
 * Run with: npx tsx prisma/seed-mattress-prices.ts
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PRICES: Record<string, number> = {
  'luxury-1000-pocket-memory-mattress': 260,
  'royale-hybrid-3000-pillow-top-mattress': 430,
  'vip-luxury-3000-pocket-mattress': 410,
}

async function main() {
  for (const [slug, price] of Object.entries(PRICES)) {
    const result = await prisma.product.updateMany({
      where: { slug },
      data: { basePrice: price },
    })
    console.log(`${slug}: updated ${result.count} row(s) to £${price}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
