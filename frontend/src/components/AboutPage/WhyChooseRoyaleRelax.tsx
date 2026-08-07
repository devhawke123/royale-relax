import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Reason {
  number: string
  icon: string
  title: string
  description: string
}

const REASONS: Reason[] = [
  {
    number: '01',
    icon: '/icons/made-in.svg',
    title: 'Made in Yorkshire',
    description:
      'Handcrafted in the heart of Yorkshire by skilled British artisans, every Royale Relax bed reflects generations of craftsmanship and attention to detail.',
  },
  {
    number: '02',
    icon: '/icons/box.svg',
    title: 'Delivered Direct',
    description:
      'An exclusive online brand bringing luxury beds and mattresses straight to your doorstep—no showrooms, no compromises.',
  },
  {
    number: '03',
    icon: '/icons/sparkle.svg',
    title: 'Crafted For Comfort',
    description:
      'Made using the finest sustainable materials and innovative techniques to deliver exceptional comfort, support, and durability.',
  },
]

export function WhyChooseRoyaleRelax() {
  return (
    <section className="bg-white px-6 py-16 xl:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-normal tracking-[4.2px] text-[#b87333] uppercase">
          Excellence Redefined
        </p>

        <h2 className="mt-3 text-5xl font-normal tracking-[-1.8px] text-[#171717] sm:text-6xl lg:text-[72px]">
          Why Choose <span className="text-[#b87333]">Royale Relax</span>
        </h2>
        <p className="mt-4 text-lg text-[#525252]">
          Discover the perfect blend of British craftsmanship, innovation, and luxury
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <div
              key={reason.number}
              className="relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border-2 border-[#e5e5e5] bg-white p-8 text-left shadow-sm"
            >
              <span className="absolute top-6 right-8 text-7xl font-bold text-[#f5f5f5]">
                {reason.number}
              </span>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#b87333] p-0.5">
                <Image
                  src={reason.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8"
                  aria-hidden
                />
              </div>
              <p className="text-2xl tracking-[-0.6px] text-[#171717]">{reason.title}</p>
              <p className="text-sm leading-[22.75px] text-[#525252]">{reason.description}</p>
            </div>
          ))}
        </div>

        <Link href="/shop/beds" className="mt-12 inline-block">
          <Button variant="primary" className="px-11 py-3.5 text-base font-bold">
            Explore Our Collection
          </Button>
        </Link>
      </div>
    </section>
  )
}
