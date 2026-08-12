import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { mockTestimonials } from '@/data/mock-testimonials'

export function Testimonials() {
  const [first, quote, ...rest] = mockTestimonials

  return (
    <section className="bg-[#f5f5f5] px-6 py-16 sm:py-20 xl:px-8">
      <h2 className="text-center text-3xl font-bold text-[#222] capitalize sm:text-4xl">
        What Our Customers Are Saying
      </h2>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-stretch gap-6 lg:flex-row lg:items-center">
        {first && (
          <div className="relative flex h-56 shrink-0 items-end overflow-hidden rounded-2xl bg-stone-300 p-6 lg:h-56 lg:w-64">
            <Image
              src={first.avatar}
              alt={first.name}
              fill
              sizes="256px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative text-white">
              <p className="text-lg font-medium">{first.name}</p>
              <p className="text-lg">{first.role}</p>
            </div>
          </div>
        )}

        {quote && (
          <div className="flex flex-1 flex-col gap-6 rounded-2xl bg-[#f3f3f3] p-8 lg:flex-row lg:items-center lg:p-10">
            <div className="flex flex-1 flex-col gap-5">
              <span aria-hidden className="text-5xl leading-none text-stone-800">
                “
              </span>
              <div className="flex items-center gap-1">
                <span className="text-amber-400">{'★'.repeat(quote.rating)}</span>
                <span className="text-2xl font-medium text-[#222]">{quote.rating.toFixed(1)}</span>
              </div>
              <p className="text-base leading-relaxed text-stone-700">
                &ldquo;{quote.quote}&rdquo;
              </p>
            </div>
            <div className="relative hidden h-64 w-56 shrink-0 overflow-hidden rounded-2xl bg-stone-300 p-6 lg:flex lg:items-end">
              <Image
                src={quote.avatar}
                alt={quote.name}
                fill
                sizes="224px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative text-white">
                <p className="text-lg font-medium">{quote.name}</p>
                <p className="text-lg">{quote.role}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex shrink-0 flex-col gap-6 lg:w-64">
          <div className="hidden items-center gap-3 lg:flex lg:self-end">
            <button
              type="button"
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#222] text-white hover:bg-black"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#222] text-white hover:bg-black"
            >
              ›
            </button>
          </div>
          {rest.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative flex h-56 items-end overflow-hidden rounded-2xl bg-stone-300 p-6"
            >
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                sizes="256px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative text-white">
                <p className="text-lg font-medium">{testimonial.name}</p>
                <p className="text-lg">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Button variant="primary" className="px-8 py-3.5 font-bold">
          + Add Review
        </Button>
      </div>
    </section>
  )
}
