/**
 * Seed script: populates description, basePrice, and size/price
 * ProductVariant rows for mattresses, sourced verbatim from the
 * "Mattresses Page Pricing" PDF supplied by the PM (images excluded per
 * the PM's instruction — same approach as seed-bed-catalog-details.ts).
 *
 * Matching strategy: looks up each Product by name (case-insensitive,
 * trimmed) within category = 'MATTRESSES'. DB rows with no catalog match
 * are left untouched; catalog entries with no DB match (e.g. "Presidential
 * Hand-Stitched Pillow Top Mattress") are skipped and reported.
 *
 * Run with: npx tsx prisma/seed-mattress-catalog-details.ts
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const SIZES = ['Small Double', 'Double', 'King', 'Super King'] as const

type MattressEntry = {
  prices: [number, number, number, number]
  description: string
}

const CATALOG_DATA: Record<string, MattressEntry> = {
  'Royale Hybrid 3000 Pillow Top Mattress': {
    prices: [430, 470, 550, 630],
    description: `Indulge in the ultimate sleep experience with the Royale Hybrid 3000 Pillow Top Mattress, crafted for restorative rest and unrivaled comfort. Featuring 3,000 pocket springs, zero gravity foam, 100% British wool, Belgian viscose, and a luxury micro-quilted panel, it offers sumptuous support and elegance. Finished with a damask grey border and no tufts, this mattress is the epitome of sophisticated design and indulgent luxury—wake each day refreshed, revitalized, and inspired.

Premium Features:

- Dual-Action 3,000 Spring System: Reactive pocket and tablet springs micro-adjust to every movement, isolating motion and delivering precise pressure relief.

- Seamless Tuftless Surface: A smooth, level top panel eliminates bumps, dips, or lumps for uninterrupted comfort.

- Pressure-Relieving Memory Foam: Deep, indulgent foam cradles your body, offering a weightless, custom-fit sensation.

- Artisan Wool & Cotton Blend: Premium natural fibers regulate temperature and wick moisture for year-round breathability.

- Edge-to-Edge Stability: Reinforced perimeter support ensures consistent firmness across the mattress, expanding your usable sleep area.

- 3-Year Quality Assurance: Enjoy total peace of mind with a comprehensive 3-year manufacturer's warranty.

- Medium-Soft Comfort: Plush, cloud-like surface provides cushioned comfort while supporting optimal spinal alignment.

- 34cm Depth: Generous, statement-making height adds layers of luxury and a commanding presence to any bedroom.

- Quilted Pillow-Top Finish: Integrated topper delivers an extra layer of softness for a truly opulent "sink-in" experience.

Why Choose The Royale Hybrid 3000 Pillow Top Mattress?

Invest in sleep that looks after you. The Royale Hybrid 3000 Pillow Top Mattress is more than just a mattress, it is a commitment to your wellbeing. Crafted with hypoallergenic, dust-mite-resistant materials with a 100% chemical-free cover, we have created a sanctuary that is as healthy as it is indulgent. Complete with flag-stitched handles for effortless care and a 3-year guarantee, it represents a premier investment in the quality of your rest.

Turn bedtime into a luxurious retreat with the Royale Hybrid 3000 Pillow Top Mattress. Get yours today!

Please note that all measurements are approximate and allow for a tolerance of plus or minus 1–2 cm.`,
  },
  'VIP Luxury 3000 Pocket Mattress': {
    prices: [410, 460, 520, 590],
    description: `Elevate your sleep to unparalleled luxury with the VIP Luxury 3000 Pocket Mattress. This opulent hybrid of foam and pocket springs delivers supreme comfort and support, leaving you refreshed and invigorated each morning—an exquisite addition to your bedroom sanctuary.

Revolutionize your nights with this superior mattress, offering unmatched relaxation for the ultimate restorative sleep, whether upgrading or seeking blissful repose.

Premium Features:

- Natural Luxury: 100% Yorkshire wool and cotton for breathable, temperature-regulating comfort.

- Zero Gravity Foam: This specialized foam is designed to distribute weight evenly, reducing pressure points to give you a "weightless" feel.

- Layered Design: A mix of wool, memory foam, and hypoallergenic white fibers ensures a soft initial feel backed by consistent support.

- 3,000 Reactive Springs: A high spring count (pocket and tablet springs) means the mattress can contour precisely to your body shape.

- Edge-to-Edge Support: Prevents that "rolling off" feeling and allows you to use the full width of the bed.

- Hand-Stitched Borders: Three rows of stitching on the sides help the mattress maintain its shape over time, preventing the sides from bulging.

- Hypoallergenic: Dust-mite resistant and features a 100% chemical-free cover, making it safer for people with allergies or skin sensitivities.

- Airflow: Chrome vents allow air to circulate through the core, preventing heat buildup and moisture.

- Stability: Hand-tufted wool rosettes ensure the internal fillings don't shift or clump over years of use.

- 3-Year Guarantee: Worry-free with a full 3-year warranty.

- Chemical-Free: 100% chemical-free cover for a natural bed environment.

- Medium Firm: Provides a luxuriously balanced feel, offering supportive comfort and optimal spinal alignment without feeling too firm or too soft.

- 28cm Depth: Provides a generous thickness for enhanced durability and layering, ensuring long-lasting comfort and a plush sleeping surface.

Why Choose the VIP Luxury 3000 Pocket Mattress?

Experience the indulgent comfort of the VIP Luxury 3000 Pocket Mattress, wrapped in soft layers of wool, cotton, and memory foam. The special Zero Gravity Foam and 3,000 moving pocket springs give you custom support and great comfort for the best rest ever. Hand-sewn edges and wool tufts add style and make it last longer.

Rest easy on a mattress designed with your wellbeing in mind. Allergy-friendly and dust mite–resistant, it features a chemical-free cover for a cleaner sleep, chrome vents for airflow, and handy side handles for convenience.

Make every night a luxury experience with the VIP Luxury 3000 Pocket Mattress. Order yours now!

Please note that all measurements are approximate and allow for a tolerance of plus or minus 1–2 cm.`,
  },
  'Luxury 1000 Pocket Memory Mattress': {
    prices: [260, 300, 360, 410],
    description: `Enhance your rest with the Luxury 1000 Pocket Memory Mattress, engineered for superior comfort and stability. Picture yourself settling into an ideal mix of premium foam and responsive pocket springs, guaranteeing you rise feeling energized and prepared for whatever lies ahead. This mattress is an ideal choice for anyone who prioritizes excellence and restful nights.

Meticulously constructed with precision, the Luxury 1000 Pocket Memory Mattress delivers a soft yet firm sleeping surface that conforms to your shape for complete unwinding. Whether you lead a busy life or just appreciate true relaxation, this mattress will elevate your bedtime ritual into a restorative ritual.

Premium Features:

- Enhanced Rest: Indulge in invigorating slumber on our robust 1000-pocket memory mattress, ideal for dynamic individuals.

- Superior Stability: The 1000 responsive pocket spring system delivers outstanding reinforcement, molding to your body's curves.

- Opulent Padding: Layers of cotton and memory foam create a sumptuous, soothing sensation.

- Ventilation: Vents promote excellent airflow, maintaining freshness.

- Convenient Mobility: Flag-stitched handles simplify repositioning the mattress.

- High-density: Insulator Layer that reinforces the mattress core, prevents sagging, and blocks coil feel-through for long-lasting support and durability.

- Organic Softness: Natural materials boost overall coziness, leading to serene sleep.

- Sturdy Build: Hand-tufted design locks in the fillings, preserving the mattress's structure.

- Edge-to-Edge Support: Reinforced perimeter support ensures consistent firmness across the mattress, expanding your usable sleep area.

Why Choose the Luxury 1000 Pocket Memory Mattress?

Indulge in exceptional comfort with the Luxury 1000 Pocket Memory Mattress. Its adaptive pocket spring core collaborates seamlessly with cotton and memory foam layers to create an unmatched sleeping sensation.

Designed with full edge support and natural fillings, this mattress offers a more spacious sleep surface and elevated comfort—making it a refined choice for truly restful nights. Start Sleeping Better Tonight!

Please note that all measurements are approximate and allow for a tolerance of plus or minus 1–2 cm.`,
  },
  'Presidential Hand-Stitched Pillow Top Mattress': {
    prices: [480, 540, 610, 710],
    description: `Dive into the luxury of the Presidential Hand-Stitched Pillow Top Mattress – where exquisite comfort meets masterful craftsmanship. This exquisite masterpiece gives you an unparalleled sleep experience, with its detailed hand-stitched design and soft pillow top that promises peaceful nights. Say goodbye to tossing and turning, and welcome unmatched support and relaxation. Designed for those who demand the finest, this mattress elevates your sleep experience like never before.

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

Please note that all measurements are approximate and allow for a tolerance of plus or minus 1–2 cm.`,
  },
}

async function main() {
  const mattresses = await prisma.product.findMany({ where: { category: 'MATTRESSES' } })

  const matchedDbNames = new Set<string>()

  for (const mattress of mattresses) {
    const dbNameLower = mattress.name.trim().toLowerCase()
    const key = Object.keys(CATALOG_DATA).find((name) => name.toLowerCase() === dbNameLower)

    if (!key) continue

    matchedDbNames.add(dbNameLower)
    const entry = CATALOG_DATA[key]

    await prisma.product.update({
      where: { id: mattress.id },
      data: {
        description: entry.description,
        basePrice: entry.prices[0],
      },
    })

    for (let i = 0; i < SIZES.length; i++) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: mattress.id, size: SIZES[i] } },
        update: { price: entry.prices[i] },
        create: { productId: mattress.id, size: SIZES[i], price: entry.prices[i] },
      })
    }

    console.log(`Updated: ${mattress.name}`)
  }

  const unmatchedCatalog = Object.keys(CATALOG_DATA).filter(
    (n) => !matchedDbNames.has(n.toLowerCase())
  )
  if (unmatchedCatalog.length) {
    console.warn('Catalog entries with NO matching DB product:', unmatchedCatalog)
  }

  const unmatchedDb = mattresses
    .filter((m) => !matchedDbNames.has(m.name.trim().toLowerCase()))
    .map((m) => m.name)
  if (unmatchedDb.length) {
    console.warn('DB mattresses with NO catalog match (not touched):', unmatchedDb)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
