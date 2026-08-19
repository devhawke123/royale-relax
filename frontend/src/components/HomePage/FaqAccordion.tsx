import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { mockFaqs } from '@/data/mock-faqs'

const trustPoints = [
  '12 Month Warranty',
  'UK Handcrafted',
  'Premium Materials',
  'Free Consultation',
]

const faqIcons = ['/icons/faq1.svg', '/icons/faq2.svg', '/icons/faq3.svg', '/icons/faq4.svg']

export function FaqAccordion() {
  return (
    <section
      id="faq"
      className="bg-[#f3f3f3] px-6 py-16 sm:py-20 xl:px-8"
      style={{ scrollMarginTop: 'var(--header-height, 180px)' }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white">
          ✨ Frequently Asked Questions
        </span>
        <h2 className="mt-6 text-4xl font-bold text-[#101828] sm:text-5xl lg:text-6xl">
          Why Choose Us
        </h2>
        <p className="mt-4 text-lg text-[#4a5565]">
          Here are the reasons why Royale Relax stands out as the ultimate choice in luxury sleeping
          solutions
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {trustPoints.map((point) => (
            <span
              key={point}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#364153] shadow-[0_4px_3px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.1)]"
            >
              <span className="text-emerald-500">✓</span> {point}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4">
        {mockFaqs.map((faq, index) => (
          <details
            key={faq.id}
            className="group rounded-2xl bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-6 marker:content-none">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#b87333] shadow">
                <Image src={faqIcons[index % faqIcons.length]} alt="" width={20} height={20} />
              </span>
              <span className="flex-1 text-lg text-[#101828]">{faq.question}</span>
              <span className="shrink-0 text-stone-400 transition-transform group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <p className="px-6 pb-6 pl-[76px] text-sm text-stone-600">{faq.answer}</p>
          </details>
        ))}
      </div>

      <div
        className="mx-auto mt-10 max-w-3xl rounded-2xl px-6 py-10 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
        style={{ background: 'linear-gradient(90deg, #B87333 0%, #FAF5F5 47%, #B87333 88%)' }}
      >
        <h3 className="text-2xl font-bold text-[#222] sm:text-3xl">Still Have Questions?</h3>
        <p className="mx-auto mt-3 max-w-md text-base text-[#222]">
          Our expert team is here to help you find the perfect sleeping solution. Get in touch for
          personalized advice.
        </p>
        <Link href="/contact" className="mt-6 inline-block">
          <Button variant="primary" className="px-8 py-3.5 font-bold">
            Contact Our Experts
          </Button>
        </Link>
      </div>
    </section>
  )
}
