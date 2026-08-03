import 'dotenv/config'
import fs from 'node:fs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { Category, ProductStatus } from '../generated/prisma/enums'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type ManifestImage = {
  path: string
  color?: string
}

type ManifestProduct = {
  name: string
  slug: string
  images: ManifestImage[]
}

type Manifest = Record<string, ManifestProduct[]>

const DEFAULT_COLOR_NAME = 'Default'

function groupImagesByColor(images: ManifestImage[]) {
  const groups = new Map<string, ManifestImage[]>()

  for (const image of images) {
    const colorName = image.color?.trim() || DEFAULT_COLOR_NAME
    const existing = groups.get(colorName) ?? []
    existing.push(image)
    groups.set(colorName, existing)
  }

  return groups
}

function normalizeImagePath(path: string) {
  return `/images/Products/${path.replace(/^\/?products\//i, '')}`
}

async function main() {
  const manifest: Manifest = JSON.parse(fs.readFileSync('./data/products-manifest.json', 'utf-8'))

  await prisma.product.deleteMany({
    where: { slug: { in: Object.values(manifest).flat().map((product) => product.slug) } },
  })

  for (const category of Object.keys(manifest)) {
    for (const product of manifest[category]) {
      const colorGroups = groupImagesByColor(product.images)
      const colorEntries = [...colorGroups.entries()]
      let firstImageMarked = false

      await prisma.product.create({
        data: {
          slug: product.slug,
          name: product.name,
          category: category.toUpperCase() as Category,
          basePrice: 0,
          status: ProductStatus.PUBLISHED,
          colors: {
            create: colorEntries.map(([colorName, images], colorIndex) => ({
              name: colorName,
              isDefault: colorIndex === 0,
              sortOrder: colorIndex,
              images: {
                create: images.map((img, imageIndex) => {
                  const isMain = !firstImageMarked
                  if (isMain) {
                    firstImageMarked = true
                  }

                  return {
                    path: normalizeImagePath(img.path),
                    isMain,
                    sortOrder: imageIndex,
                  }
                }),
              },
            })),
          },
        },
      })

      console.log(`Seeded ${product.slug} (${colorEntries.length} color(s))`)
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
