import { getStoreSettings } from '@/lib/store-settings'

function buildFaqs(phone: string) {
  return [
  {
    question: 'How Long Does Delivery Take Once I Have Placed My Order?',
    answer:
      'Most orders are delivered within 2-4 weeks, as each piece is handcrafted to order. We will confirm an estimated delivery window as soon as your order is placed.',
  },
  {
    question: 'Can I Choose My Delivery Date And Time?',
    answer:
      'Yes — once your order is ready to ship, our delivery team will contact you to arrange a date and time slot that works for you.',
  },
  {
    question: 'Can I Place My Order Over The Phone?',
    answer: `Absolutely. Call us on ${phone} and a member of our team will help you place your order and answer any questions.`,
  },
  {
    question: 'Where Are Your Products Manufactured?',
    answer:
      'Every Royale Relax piece is handcrafted in Yorkshire, UK, using carefully selected, sustainable materials.',
  },
  {
    question: 'What Colours Are The Beds Available In?',
    answer:
      'Our beds are available in a wide range of fabric colours and finishes. Visit the Fabric Sample page or get in touch for the full colour range.',
  },
  {
    question: 'Do You Offer Free Delivery?',
    answer:
      'We offer free standard delivery across mainland UK on all orders. Additional charges may apply for remote areas.',
  },
  {
    question: 'Which Payment Methods Are Accepted In The Online Shop?',
    answer:
      'We accept all major debit and credit cards, as well as secure online payment methods at checkout.',
  },
  {
    question: 'How Long Will Delivery Take?',
    answer:
      'Delivery timelines vary by product but typically range from 2-4 weeks. We will keep you updated throughout the process.',
  },
  ]
}

export async function ContactFaq() {
  const { phone } = await getStoreSettings()
  const faqs = buildFaqs(phone)

  return (
    <section className="bg-white px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-12">
        <h2 className="text-center text-3xl text-[#2c2c2c] sm:text-[36px]">
          Frequently Asked Questions
        </h2>

        <div className="flex w-full flex-col gap-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[10px] border border-[#b87333] bg-white px-6 py-1 shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm text-[#2c2c2c] marker:content-none">
                {faq.question}
                <span className="shrink-0 text-[#b87333] transition-transform group-open:rotate-180">
                  ⌄
                </span>
              </summary>
              <p className="pb-5 text-sm text-[#6a6d70]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
