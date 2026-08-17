import { HeroBanner } from '@/components/HomePage/HeroBanner'
import { TrustBar } from '@/components/HomePage/TrustBar'
import { BrandStrip } from '@/components/HomePage/BrandStrip'
import { FeaturedProducts } from '@/components/HomePage/FeaturedProducts'
import { BestSellers } from '@/components/HomePage/BestSellers'
import { ProductCarousel } from '@/components/HomePage/ProductCarousel'
import { AboutSection } from '@/components/HomePage/AboutSection'
import { BedOfTheWeek } from '@/components/HomePage/BedOfTheWeek'
import { FaqAccordion } from '@/components/HomePage/FaqAccordion'
import { Testimonials } from '@/components/HomePage/Testimonials'
import {
  getFeaturedProducts,
  getProductBySlug,
  getProductsBySlugsInOrder,
  toDisplayProduct,
} from '@/lib/products'
import { getStorefrontBedOfTheWeek } from '@/lib/bed-of-the-week'

// Prisma reads aren't fetch-tracked, so without this the route gets
// statically cached on first request and admin edits (price, featured
// picks, Bed of the Week, etc.) never show up until the next deploy.
export const revalidate = 0

// Hand-curated picks (no isFeatured/isBestSeller signal in the DB yet).
const FEATURED_SLUGS = ['versailles-bed', 'verona-bed', 'elan-bed']
const BEST_SELLER_SLUGS = [
  'celestia-bed',
  'balmoral-bed',
  'grand-regent-bed',
  'harington-bed',
  'luxe-divan-bed',
  'harington-bed',
]

export default async function MarketingPage() {
  const [featuredProducts, latestProducts, bestSellerProducts, bedOfTheWeekPromo] = await Promise.all([
    getProductsBySlugsInOrder(FEATURED_SLUGS),
    getFeaturedProducts(3),
    getProductsBySlugsInOrder(BEST_SELLER_SLUGS),
    getStorefrontBedOfTheWeek(),
  ])
  const featured = featuredProducts.map(toDisplayProduct)
  const latest = latestProducts.map(toDisplayProduct)
  const bestSellers = bestSellerProducts.map(toDisplayProduct)

  const bedOfTheWeekProductRow = bedOfTheWeekPromo
    ? await getProductBySlug(bedOfTheWeekPromo.product.slug)
    : null
  const bedOfTheWeek = bedOfTheWeekProductRow ? toDisplayProduct(bedOfTheWeekProductRow) : undefined

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <HeroBanner
        eyebrow="PREMIUM SLEEP COLLECTION 2026"
        titleLine1="Sleep in"
        titleLine2="Pure Luxury"
        description="Experience unparalleled comfort with our handcrafted bed collection. Each piece is designed to transform your bedroom into a sanctuary of rest and elegance."
        image="/images/lifestyle/hero-bedroom.jpg"
        primaryCta={{ label: 'SHOP NOW', href: '/shop/beds' }}
        secondaryCta={{ label: 'CONTACT US', href: '/contact' }}
      />
      <TrustBar
        items={[
          {
            icon: '/icons/express-delivery.png',
            title: 'Express Delivery',
            subtitle: 'Uk & Highland',
          },
          {
            icon: '/icons/crafted-with-love.png',
            title: 'Crafted With Love',
            subtitle: '12 Months warranty',
          },
          {
            icon: '/icons/suport-services.png',
            title: 'Support Services',
            subtitle: 'contact us anytime',
          },
        ]}
      />
      <BrandStrip />
      <FeaturedProducts products={featured} />
      <ProductCarousel
        items={latest}
        title="Latest Products"
        description="Discover our handpicked selection of luxury beds designed to transform your bedroom"
      />

      <BestSellers products={bestSellers} />

      <AboutSection />

      {bedOfTheWeek && bedOfTheWeekPromo && (
        <BedOfTheWeek
          product={bedOfTheWeek}
          discountPercentage={bedOfTheWeekPromo.discountPercentage}
          validUntil={bedOfTheWeekPromo.validUntil}
          isPromotionLive={bedOfTheWeekPromo.isPromotionLive}
        />
      )}

      <FaqAccordion />

      <Testimonials />
    </main>
  )
}
