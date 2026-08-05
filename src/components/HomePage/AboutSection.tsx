import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import arrowIcon from '../../../public/images/icons/arrow-duotone.svg'

export function AboutSection() {
  return (
    <section
      className="bg-[#f3f3f3] px-6 py-14 xl:px-8"
      style={{ scrollMarginTop: 'var(--header-height, 180px)' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:h-[533px] lg:flex-row lg:items-center lg:gap-6">
        <div className="flex flex-col justify-center lg:h-full lg:w-[45%] lg:shrink-0">
          <p className="text-base font-medium text-[#9d6026]">About Us</p>
          <h2 className="mt-3 text-3xl leading-tight font-normal text-[#110d0a] capitalize sm:text-4xl lg:text-[40px] lg:leading-[1.15]">
            Designing Spaces That Feel Like Home
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#757575] lg:text-xl">
            <span className="font-bold">Royale Relax</span> the pinnacle of luxury sleep, proudly
            handcrafted in the heart of Yorkshire, UK. As an exclusive online destination with no
            physical stores, we dedicate ourselves to curating and delivering premium beds and
            mattresses directly to your doorstep, blending timeless British artistry with
            cutting-edge innovation.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[#757575] lg:text-xl">
            Each masterpiece is born from the hands of skilled artisans, using only the finest,
            sustainable materials to promise supreme comfort, lasting support, and outstanding
            durability. Whether you crave the plush embrace of a bespoke mattress or the
            sophisticated lines of a custom bed frame. By combining time-honoured techniques with
            modern innovation, we produce beds that don&apos;t just look beautiful they transform
            the way you rest.
          </p>
          <Link href="/about" className="mt-8 inline-block">
            <Button
              variant="primary"
              className="rounded-none bg-[#b87333] px-11 py-4 text-base font-bold hover:bg-[#a3662e] leading-none [&>*]:-translate-y-0.5"
            >
              More About Us
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:h-full lg:flex-1 lg:grid-cols-[1fr_1fr]">
          <div className="relative aspect-[300/533] w-full overflow-hidden rounded-[20px] bg-stone-200 lg:h-full lg:aspect-auto">
            {/* eslint-disable-next-line @next/next/no-img-element -- next/image `fill` can't override object-position the way this crop needs */}
            <img
              src="/images/lifestyle/home-page-about.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[38%_center]"
            />
            <div className="absolute inset-0 rounded-[20px] bg-black/[0.26]" />
          </div>

          <div className="relative aspect-[300/533] w-full overflow-hidden rounded-[20px] bg-stone-200 lg:h-[82%] lg:aspect-auto lg:self-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- next/image `fill` can't override object-position the way this crop needs */}
            <img
              src="/images/lifestyle/home-page-about2.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[65%_35%]"
            />
            <div className="absolute inset-0 rounded-[20px] bg-black/[0.26]" />
            <div className="absolute right-0 -bottom-16 hidden items-center gap-3 lg:flex">
              <button
                type="button"
                aria-label="Previous"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#110d0a] text-white transition-colors hover:bg-black"
              >
                <Image src={arrowIcon} alt="" width={20} height={20} className="-rotate-90" />
              </button>
              <button
                type="button"
                aria-label="Next"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#110d0a] text-white transition-colors hover:bg-black"
              >
                <Image src={arrowIcon} alt="" width={20} height={20} className="rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
