import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function AboutSection() {
  return (
    <section className="bg-[#f3f3f3] px-6 py-16 xl:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr_1fr] lg:items-center">
        <div className="lg:col-span-1">
          <p className="text-base font-medium text-[#9d6026]">About Us</p>
          <h2 className="mt-4 text-3xl font-normal text-[#110d0a] capitalize sm:text-4xl">
            Designing Spaces That Feel Like Home
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#757575]">
            Royale Relax — the pinnacle of luxury sleep, proudly handcrafted in the heart of
            Yorkshire, UK. As an exclusive online destination with no physical stores, we dedicate
            ourselves to curating and delivering premium beds and mattresses directly to your
            doorstep, blending timeless British artistry with cutting-edge innovation.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[#757575]">
            Each masterpiece is born from the hands of skilled artisans, using only the finest,
            sustainable materials to promise supreme comfort, lasting support, and outstanding
            durability.
          </p>
          <Link href="/about" className="mt-8 inline-block">
            <Button
              variant="primary"
              className="rounded-none bg-[#b87333] px-11 py-4 text-base font-bold hover:bg-[#a3662e]"
            >
              More About Us
            </Button>
          </Link>
        </div>

        <div className="relative aspect-[324/533] w-full overflow-hidden rounded-2xl bg-stone-200 lg:col-span-1">
          <Image
            src="/images/beds/Verona-Bed.jpg"
            alt=""
            fill
            sizes="25vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div className="relative hidden aspect-[324/439] w-full self-start overflow-hidden rounded-2xl bg-stone-200 lg:block">
          <Image
            src="/images/beds/Elan-bed.jpg"
            alt=""
            fill
            sizes="25vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute right-0 -bottom-16 hidden items-center gap-3 lg:flex">
            <button
              type="button"
              aria-label="Previous"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#110d0a] text-white transition-colors hover:bg-black"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#110d0a] text-white transition-colors hover:bg-black"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
