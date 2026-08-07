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
import { bedOfTheWeekEndsAt } from '@/data/mock-products'
import {
  getFeaturedProducts,
  getProductsByCategory,
  getProductsBySlugsInOrder,
  toDisplayProduct,
} from '@/lib/products'

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
  const [featuredProducts, latestProducts, bestSellerProducts, bedsProducts] = await Promise.all([
    getProductsBySlugsInOrder(FEATURED_SLUGS),
    getFeaturedProducts(6),
    getProductsBySlugsInOrder(BEST_SELLER_SLUGS),
    getProductsByCategory('BEDS'),
  ])
  const featured = featuredProducts.map(toDisplayProduct)
  const latest = latestProducts.map(toDisplayProduct)
  const bestSellers = bestSellerProducts.map(toDisplayProduct)
  const bedOfTheWeek = bedsProducts[0] ? toDisplayProduct(bedsProducts[0]) : undefined

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

      {bedOfTheWeek && <BedOfTheWeek product={bedOfTheWeek} endsAt={bedOfTheWeekEndsAt} />}

      <FaqAccordion />

      <Testimonials />
    </main>
  )
}
