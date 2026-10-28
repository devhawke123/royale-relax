import 'dotenv/config'
import fs from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'
import { Category, ProductStatus } from '../generated/prisma/enums'

const url = new URL(process.env.DATABASE_URL ?? 'mysql://root:test@localhost:3306/myapp')
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  allowPublicKeyRetrieval: true,
})
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
      await prisma.product.create({
        data: {
          slug: product.slug,
          name: product.name,
          category: category.toUpperCase() as Category,
          basePrice: 0,
          status: ProductStatus.PUBLISHED,
          images: {
            create: product.images.map((img, imageIndex) => ({
              path: normalizeImagePath(img.path),
              isMain: imageIndex === 0,
              sortOrder: imageIndex,
            })),
          },
        },
      })

      console.log(`Seeded ${product.slug} (${product.images.length} image(s))`)
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
