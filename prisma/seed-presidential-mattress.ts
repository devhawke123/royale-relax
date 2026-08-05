/**
 * Seed script: creates the "Presidential Hand-Stitched Pillow Top Mattress"
 * product, which existed in the catalog PDF and has images already present
 * under public/images/Products/mattresses/presidential-hand-stitched-pillow-top/
 * but had no corresponding DB row (seed-mattress-catalog-details.ts skipped
 * it for this reason).
 *
 * Run with: npx tsx prisma/seed-presidential-mattress.ts
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const SIZES = ['Small Double', 'Double', 'King', 'Super King'] as const
const PRICES: [number, number, number, number] = [480, 540, 610, 710]

const DESCRIPTION = `Dive into the luxury of the Presidential Hand-Stitched Pillow Top Mattress – where exquisite comfort meets masterful craftsmanship. This exquisite masterpiece gives you an unparalleled sleep experience, with its detailed hand-stitched design and soft pillow top that promises peaceful nights. Say goodbye to tossing and turning, and welcome unmatched support and relaxation. Designed for those who demand the finest, this mattress elevates your sleep experience like never before.

Premium Features of the Presidential Hand-Stitched Pillow Top Mattress:

- Expertly Hand-Stitched: Each Mattress is carefully stitched by hand for unparalleled strength and a perfect look, so you get quality sleep for years to come.

- Luxury Stitching & Border: Three-row stitched border ensures edge-to-edge durability and refined craftsmanship.

- Luxurious Natural Layers: Multiple layers of 100% Yorkshire wool, cotton, cashmere, and silk for unmatched softness. The airy fabric lets air flow freely, keeping you cool and comfy all night long.

- Plush Pillow Top Comfort: The soft pillow top feels like a fluffy cloud, bringing five-star hotel luxury to your bed every night.

- Strong Support System: With a high-density core, it keeps your spine aligned just right, easing away aches and pains.

- Allergy-Friendly Materials: Built with hypoallergenic fabrics, it's ideal for anyone with allergies, creating a fresh and healthy sleep space.

- Medium Soft Firmness: Enjoy a balanced feel that's just right for ultimate comfort.

- 35cm Depth: Provides generous cushioning for a deeper, more luxurious sleep experience.

- 3-Year Warranty: Backed by a reliable 3-year warranty for added peace of mind and long-term assurance.

Why the Presidential Hand-Stitched Pillow Top Mattress Stands Out?

The ultimate sleep upgrade. Combining classic hand-stitching with modern luxury technology, the Presidential Hand-Stitched Pillow Top Mattress delivers unmatched comfort, spine-aligned support. Sleep deeply, rise energized, live exceptionally.

Elevate your nights to true luxury. Bring home the Presidential Hand-Stitched Pillow Top Mattress today!

Please note that all measurements are approximate and allow for a tolerance of plus or minus 1–2 cm.`

async function main() {
  const existing = await prisma.product.findUnique({
    where: { slug: 'presidential-hand-stitched-pillow-top-mattress' },
  })

  if (existing) {
    console.log('Product already exists, skipping creation.')
    return
  }

  const product = await prisma.product.create({
    data: {
      slug: 'presidential-hand-stitched-pillow-top-mattress',
      name: 'Presidential Hand-Stitched Pillow Top Mattress',
      description: DESCRIPTION,
      category: 'MATTRESSES',
      basePrice: PRICES[0],
      status: 'PUBLISHED',
      colors: {
        create: {
          name: 'Default',
          isDefault: true,
          sortOrder: 0,
          images: {
            create: [
              {
                path: '/images/Products/mattresses/presidential-hand-stitched-pillow-top/main.webp',
                isMain: true,
                sortOrder: 0,
              },
              {
                path: '/images/Products/mattresses/presidential-hand-stitched-pillow-top/secondary.webp',
                isMain: false,
                sortOrder: 1,
              },
            ],
          },
        },
      },
      variants: {
        create: SIZES.map((size, i) => ({ size, price: PRICES[i] })),
      },
    },
  })

  console.log(`Created: ${product.name} (${product.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
