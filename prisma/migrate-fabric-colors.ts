/**
 * One-off backfill: splits the old FABRICS catalog into proper Fabric /
 * FabricColor rows.
 *
 * Before this migration the FABRICS category in `Product` held two broken
 * populations:
 *   1. Seven "family" Product rows (Chenille, Cord Grey, Crushed Velvet,
 *      Dumfries, Marble, Naple, Plush Soft) whose ProductColor rows were
 *      the real, working colour swatches (correct images, but no `code`
 *      field and inconsistent/typo'd colour names).
 *   2. 82 duplicate single-colour Product rows (e.g. "CH07 Chenille Teal")
 *      left over from an unfinished seed script — zero colors, zero images.
 *
 * This script rebuilds the family data into Fabric + FabricColor rows. The
 * code/colorName pairs below were derived from the canonical colour list in
 * the old seed-fabrics.ts and hand-matched, in order, against each family's
 * ProductColor rows (ordered by sortOrder) — verified 1:1 by inspecting the
 * live DB before writing this script. Two colours (DF01 Dumfries Latte,
 * PL14 Plush Soft Velvet Cream) have no image asset in the DB or on disk and
 * are intentionally skipped.
 *
 * Run with: npx tsx prisma/migrate-fabric-colors.ts
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type ColorSeed = { code: string; colorName: string }

type FamilySeed = {
  fabricName: string
  fabricSlug: string
  /** slug of the old "family" Product row this data is migrated from */
  sourceProductSlug: string
  /** code/colorName pairs, in the same order as the source ProductColor rows (by sortOrder) */
  colors: ColorSeed[]
}

const FAMILIES: FamilySeed[] = [
  {
    fabricName: 'Chenille',
    fabricSlug: 'chenille',
    sourceProductSlug: 'chenille',
    colors: [
      { code: 'CH01', colorName: 'Cream' },
      { code: 'CH02', colorName: 'Mink' },
      { code: 'CH03', colorName: 'Chocolate' },
      { code: 'CH04', colorName: 'Silver' },
      { code: 'CH06', colorName: 'Duck Egg' },
      { code: 'CH07', colorName: 'Teal' },
      { code: 'CH08', colorName: 'Purple' },
      { code: 'CH09', colorName: 'Aubergine' },
      { code: 'CH10', colorName: 'Red' },
      { code: 'CH11', colorName: 'Black' },
    ],
  },
  {
    fabricName: 'Cord',
    fabricSlug: 'cord',
    sourceProductSlug: 'cord-grey',
    colors: [
      { code: 'CD02', colorName: 'Grey' },
      { code: 'CD03', colorName: 'Black' },
      { code: 'CD04', colorName: 'Stone' },
      { code: 'CD06', colorName: 'Champagne' },
      { code: 'CD09', colorName: 'Coffee' },
      { code: 'CD10', colorName: 'Chocolate' },
      { code: 'CD11', colorName: 'Mustard' },
      { code: 'CD12', colorName: 'Marine' },
      { code: 'CD13', colorName: 'Teal' },
    ],
  },
  {
    fabricName: 'Crushed Velvet',
    fabricSlug: 'crushed-velvet',
    sourceProductSlug: 'crushed-velvet',
    colors: [
      { code: 'CV01', colorName: 'White' },
      { code: 'CV04', colorName: 'Cream' },
      { code: 'CV05', colorName: 'Champagne' },
      { code: 'CV06', colorName: 'Gold' },
      { code: 'CV07', colorName: 'Mink' },
      { code: 'CV08', colorName: 'Brown' },
      { code: 'CV09', colorName: 'Teal' },
      { code: 'CV10', colorName: 'Denim Blue' },
      { code: 'CV11', colorName: 'Red' },
      { code: 'CV13', colorName: 'Black' },
      { code: 'CV15', colorName: 'Pewter' },
    ],
  },
  {
    fabricName: 'Dumfries',
    fabricSlug: 'dumfries',
    sourceProductSlug: 'dumfries',
    colors: [
      // DF01 Latte skipped: no image asset exists for it.
      { code: 'DF02', colorName: 'Gold' },
      { code: 'DF03', colorName: 'Mustard' },
      { code: 'DF04', colorName: 'Wine' },
      { code: 'DF05', colorName: 'Marine' },
      { code: 'DF06', colorName: 'Olive' },
      { code: 'DF07', colorName: 'Mink' },
      { code: 'DF08', colorName: 'Pewter' },
      { code: 'DF09', colorName: 'Sapphire' },
      { code: 'DF10', colorName: 'Raven' },
      { code: 'DF11', colorName: 'Steel' },
      { code: 'DF13', colorName: 'Lilac' },
      { code: 'DF14', colorName: 'Thistle' },
      { code: 'DF15', colorName: 'Claret' },
      { code: 'DF16', colorName: 'Truffle' },
    ],
  },
  {
    fabricName: 'Marble',
    fabricSlug: 'marble',
    sourceProductSlug: 'marble',
    colors: [
      { code: 'MB01', colorName: 'Silver' },
      { code: 'MB02', colorName: 'Platinum' },
      { code: 'MB03', colorName: 'Steel' },
      { code: 'MB04', colorName: 'Gunmetal' },
      { code: 'MB05', colorName: 'Oatmeal' },
      { code: 'MB06', colorName: 'Mink' },
      { code: 'MB07', colorName: 'Stone' },
      { code: 'MB08', colorName: 'Ocean' },
      { code: 'MB09', colorName: 'Peacock' },
    ],
  },
  {
    fabricName: 'Naple',
    fabricSlug: 'naple',
    sourceProductSlug: 'naple',
    colors: [
      { code: 'NP01', colorName: 'Cream' },
      { code: 'NP02', colorName: 'Beige' },
      { code: 'NP03', colorName: 'Sand' },
      { code: 'NP04', colorName: 'Mink' },
      { code: 'NP05', colorName: 'Seal Grey' },
      { code: 'NP06', colorName: 'Silver' },
      { code: 'NP07', colorName: 'Slate Grey' },
      { code: 'NP08', colorName: 'Charcoal' },
      { code: 'NP09', colorName: 'Blue' },
      { code: 'NP10', colorName: 'Purple' },
      { code: 'NP11', colorName: 'Black' },
    ],
  },
  {
    fabricName: 'Plush Soft',
    fabricSlug: 'plush-soft',
    sourceProductSlug: 'plush-soft',
    colors: [
      { code: 'PL01', colorName: 'Steel' },
      { code: 'PL02', colorName: 'Silver' },
      { code: 'PL03', colorName: 'Grey' },
      { code: 'PL05', colorName: 'Mustard' },
      { code: 'PL06', colorName: 'Sky' },
      { code: 'PL07', colorName: 'Mink' },
      { code: 'PL08', colorName: 'Turquoise' },
      { code: 'PL09', colorName: 'Blue' },
      { code: 'PL10', colorName: 'Claret' },
      { code: 'PL11', colorName: 'White' },
      { code: 'PL12', colorName: 'Pink' },
      { code: 'PL13', colorName: 'Ice' },
      // PL14 Cream skipped: no image asset exists for it.
      { code: 'PL15', colorName: 'Pebble' },
      { code: 'PL16', colorName: 'Mocca' },
      { code: 'PL17', colorName: 'Emerald' },
      { code: 'PL18', colorName: 'Burnt Orange' },
    ],
  },
]

async function main() {
  let fabricsCreated = 0
  let colorsCreated = 0
  const skipped: string[] = []

  for (const family of FAMILIES) {
    const sourceProduct = await prisma.product.findUnique({
      where: { slug: family.sourceProductSlug },
      include: { colors: { orderBy: { sortOrder: 'asc' }, include: { images: true } } },
    })

    if (!sourceProduct) {
      throw new Error(
        `Expected source product "${family.sourceProductSlug}" for fabric "${family.fabricName}" not found — aborting before any partial writes.`,
      )
    }

    if (sourceProduct.colors.length !== family.colors.length) {
      throw new Error(
        `Mismatch for "${family.fabricName}": source product has ${sourceProduct.colors.length} colors, expected ${family.colors.length}. Aborting — the position-based mapping is no longer safe to trust.`,
      )
    }

    const fabric = await prisma.fabric.upsert({
      where: { slug: family.fabricSlug },
      update: { name: family.fabricName },
      create: { slug: family.fabricSlug, name: family.fabricName, sortOrder: fabricsCreated },
    })
    fabricsCreated++

    for (let i = 0; i < family.colors.length; i++) {
      const seed = family.colors[i]
      const sourceColor = sourceProduct.colors[i]
      const imagePath = sourceColor.images[0]?.path

      if (!imagePath) {
        skipped.push(`${seed.code} ${family.fabricName} ${seed.colorName} (no image on source ProductColor)`)
        continue
      }

      await prisma.fabricColor.upsert({
        where: { code: seed.code },
        update: {
          fabricId: fabric.id,
          colorName: seed.colorName,
          imagePath,
          sortOrder: i,
        },
        create: {
          fabricId: fabric.id,
          code: seed.code,
          colorName: seed.colorName,
          imagePath,
          sortOrder: i,
        },
      })
      colorsCreated++
    }
  }

  console.log(`Done. Fabrics: ${fabricsCreated}, colors: ${colorsCreated}.`)
  if (skipped.length > 0) {
    console.log(`Skipped (no image found):\n${skipped.map((s) => `  - ${s}`).join('\n')}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
