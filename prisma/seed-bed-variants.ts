/**
 * Seed script: populates ProductVariant rows for all beds using the
 * size/price data supplied by the PM (Royale_Relax_Product_Catalog.pdf).
 *
 * Matching strategy: looks up each Product by name (case-insensitive,
 * trimmed) within category = 'BEDS'. Products in the DB with no match
 * in CATALOG_DATA are left untouched — see "Known mismatches" below.
 *
 * Run with: npx ts-node prisma/seed-bed-variants.ts
 * (or add to package.json "prisma.seed" and run npx prisma db seed)
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
// Use the generated Prisma client with the project's adapter
const prisma = new PrismaClient({ adapter })

const SIZES = ["4' Small Double", "4'6 Double", "5' King", "6' Super King"] as const;

// bedName -> [4' Small Double, 4'6 Double, 5' King, 6' Super King] prices in GBP
const CATALOG_DATA: Record<string, [number, number, number, number]> = {
  'Versailles Bed': [500, 550, 600, 650],
  'Grand Regent Bed': [550, 620, 680, 770],
  'Kensington Bed': [500, 550, 600, 650],
  'Heritage Elite Bed': [400, 450, 500, 550],
  'Grand Royale Bed': [500, 550, 610, 680],
  'Velvet Dawn Bed': [420, 470, 520, 590],
  'Majestic Bed': [550, 600, 650, 710],
  'Celestia Bed': [500, 550, 600, 650],
  'Harrington Bed': [390, 430, 470, 510], // DB currently has "Harington Bed" — see note below
  'Savoy Imperial Bed': [450, 500, 575, 625],
  'Verona Bed': [500, 550, 600, 650],
  'Balmoral Bed': [350, 400, 450, 500],
  'Royale Signature Bed': [480, 545, 615, 700],
  'Elan Bed': [440, 480, 520, 580],
  'Ellington Bed': [430, 480, 530, 580],
  'Eminence Bed': [540, 600, 670, 730],
  'Kendal Divan Bed': [350, 400, 450, 490],
  'Regent Bed': [485, 540, 610, 690],
  'Valencia Wing Bed': [470, 520, 580, 640],
  'Luxe Divan Bed': [350, 400, 450, 490],
  'Madison Divan Bed': [370, 410, 460, 510],
};

async function main() {
  const beds = await prisma.product.findMany({
    where: { category: 'BEDS' },
  });

  const catalogNamesLower = new Set(
    Object.keys(CATALOG_DATA).map((n) => n.toLowerCase())
  );
  const matchedDbNames = new Set<string>();

  for (const bed of beds) {
    const key = Object.keys(CATALOG_DATA).find(
      (name) => name.toLowerCase() === bed.name.trim().toLowerCase()
    );

    if (!key) continue; // no catalog match for this DB row — skipped, not errored

    matchedDbNames.add(bed.name.toLowerCase());
    const prices = CATALOG_DATA[key];

    for (let i = 0; i < SIZES.length; i++) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: bed.id, size: SIZES[i] } },
        update: { price: prices[i] },
        create: { productId: bed.id, size: SIZES[i], price: prices[i] },
      });
    }

    console.log(`Seeded variants for: ${bed.name}`);
  }

  // Report anything in the catalog that had no matching DB row
  const unmatchedCatalog = [...catalogNamesLower].filter(
    (n) => !matchedDbNames.has(n)
  );
  if (unmatchedCatalog.length) {
    console.warn('Catalog entries with NO matching DB product:', unmatchedCatalog);
  }

  // Report DB beds that had no catalog match (expected: Naple, Plush Soft,
  // Dumfries, Montrose Bed, and "Harington Bed" until the typo is fixed)
  const unmatchedDb = beds
    .filter((b: any) => !matchedDbNames.has(b.name.toLowerCase()))
    .map((b: any) => b.name);
  if (unmatchedDb.length) {
    console.warn('DB beds with NO catalog match (not seeded):', unmatchedDb);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
