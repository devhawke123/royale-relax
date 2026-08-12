import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { CountdownTimer } from '@/components/HomePage/CountdownTimer'

interface BedOfTheWeekProps {
  product: Product
  endsAt: string
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function BedOfTheWeek({ product, endsAt }: BedOfTheWeekProps) {
  const variant = product.variants[0]
  const price = variant?.price ?? product.basePrice
  const currency = product.currency ?? 'GBP'
  const compareAtPrice = variant?.compareAtPrice
  const savings = compareAtPrice && price !== undefined ? compareAtPrice - price : undefined

  return (
    <section className="bg-[#f5f5f5] px-4 py-16 sm:px-6 sm:py-20 xl:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium tracking-wide text-[#666] uppercase">Season Sale</p>
        <h2 className="mt-2 text-2xl font-bold text-black sm:text-4xl">Bed Of The Week</h2>
        <p className="mt-3 text-base text-[#666] sm:text-lg">
          Shop now and save big on your favorite brands and styles.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-200 sm:aspect-[640/624]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          <p className="flex items-center gap-2 text-sm font-medium tracking-wide text-[#b87333] uppercase sm:text-lg">
            <span aria-hidden>🕐</span> Deal Of The Week
          </p>
          <h3 className="text-2xl font-bold text-[#222] sm:text-4xl lg:text-5xl">{product.name}</h3>
          {product.description && (
            <p className="line-clamp-4 max-w-md text-base leading-relaxed text-[#757575] sm:text-lg">
              {product.description}
            </p>
          )}

          {price !== undefined && (
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold text-[#b3404a] sm:text-4xl lg:text-5xl">
                {formatPrice(price, currency)}
              </span>
              {compareAtPrice && (
                <span className="text-lg text-[#99a1af] line-through sm:text-xl">
                  {formatPrice(compareAtPrice, currency)}
                </span>
              )}
              {savings && savings > 0 && (
                <span className="text-sm font-bold text-[#00a63e]">
                  Save {formatPrice(savings, currency)}
                </span>
              )}
            </div>
          )}

          <div>
            <p className="mb-3 text-base text-[#222] sm:text-lg">Offer ends in:</p>
            <CountdownTimer endsAt={endsAt} />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              variant="primary"
              className="flex-1 py-4 text-base font-medium sm:flex-none sm:px-10 sm:text-lg"
            >
              Grab This Deal
            </Button>
            <Link href={`/shop/beds`} className="flex-1 sm:flex-none">
              <Button
                variant="secondary"
                className="w-full rounded-none border-2 border-[#b87333] py-4 text-base font-medium text-[#b87333] hover:bg-[#b87333]/5 sm:px-10 sm:text-lg"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
