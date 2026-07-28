import { HeroBanner } from '@/components/sections/HeroBanner'
import { TrustBar } from '@/components/sections/TrustBar'
import { BrandStrip } from '@/components/sections/BrandStrip'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { BestSellers } from '@/components/sections/BestSellers'
import { ProductCarousel } from '@/components/sections/ProductCarousel'
import { AboutSection } from '@/components/sections/AboutSection'
import { BedOfTheWeek } from '@/components/sections/BedOfTheWeek'
import { FaqAccordion } from '@/components/sections/FaqAccordion'
import { Testimonials } from '@/components/sections/Testimonials'
import { mockProducts, bedOfTheWeekEndsAt } from '@/data/mock-products'

export default function MarketingPage() {
  const featured = mockProducts.filter((product) => product.isFeatured).slice(0, 3)
  const bestSellers = mockProducts
    .filter((product) => product.isBestSeller)
    .sort((a, b) => (a.bestSellerRank ?? 0) - (b.bestSellerRank ?? 0))
  const latest = [...mockProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
  const bedOfTheWeek = mockProducts.find((product) => product.isBedOfTheWeek) ?? mockProducts[0]

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

      <BestSellers products={bestSellers} />
      {/* 
      <ProductCarousel
        items={latest}
        title="Latest Products"
        description="Discover our handpicked selection of luxury beds designed to transform your bedroom"
      /> */}

      {/* <AboutSection />

      <BedOfTheWeek product={bedOfTheWeek} endsAt={bedOfTheWeekEndsAt} />

      <FaqAccordion />

      <Testimonials /> */}
    </main>
  )
}
