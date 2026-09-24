function buildFaqs() {
  return [
  {
    question: 'How Long Does Delivery Take Once I Have Placed My Order?',
    answer:
      'Most orders are delivered within 7-10 working days, as each piece is handcrafted to order. We will confirm an estimated delivery window as soon as your order is placed.',
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
      'We offer free delivery to Mainland UK and the Scottish Highlands. Additional charges may apply for remote areas.',
  },
  {
    question: 'Which Payment Methods Are Accepted In The Online Shop?',
    answer:
      'We accept all major debit and credit cards, as well as secure online payment methods at checkout.',
  },
  {
    question: 'What Is The Difference Between A Slatted Base Ottoman And A Solid Base Ottoman?',
    answer:
      'At Royale Relax, we offer two premium Ottoman base options – Slatted and Solid – designed to provide exceptional support, durability and practical storage. Our Slatted Ottoman Base is delivered flat-packed for assembly and features securely fitted wooden slats, creating a strong and supportive foundation for your mattress. Our Solid Ottoman Base is supplied pre-built in two sections, offering a more substantial, robust foundation and two generous storage compartments for effortless organisation. Due to its size, we recommend this option for homes with spacious staircases and suitable access. Both options combine quality craftsmanship with practical design, with the main difference being the construction, assembly and access requirements.',
  },
  {
    question: 'What Measurements Do I Need To Check?',
    answer:
      'Before placing your order, we recommend taking a few essential measurements to ensure your new bed can be delivered and positioned with ease. As the headboard is typically the largest component, measure the width and height of your doors, hallways and any narrow access points. Also, check the available space in your chosen room, including any tight corners or potential obstacles along the delivery route. Once measured, compare your dimensions with the bed and headboard specifications. If you’re unsure, our team is always happy to help you plan the best route and ensure a smooth delivery experience.',
  },
  {
    question: 'How Can I Return An Item?',
    answer:
      'At Royale Relax products are custom made to your order specs (size and colour), and items are non-returnable. To make sure you are completely satisfied before purchasing:\n\nOrder Swatches: Get free fabric samples in advance to check materials and colors. Contact our team via phone or WhatsApp for guidance before ordering.\n\n Exceptions & Damaged Goods: If we send the wrong item or it arrives damaged, contact customer support within 48 hours of delivery to arrange a return and replacement.',
  },
  ]
}

export function ContactFaq() {
  const faqs = buildFaqs()

  return (
    <section id="faq" className="scroll-mt-24 bg-white px-6 py-16 sm:px-10 lg:px-20">
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
              <p className="pb-5 text-sm whitespace-pre-line text-[#6a6d70]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
