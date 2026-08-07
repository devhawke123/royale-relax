import Image from 'next/image'
import Link from 'next/link'
import { ContactForm } from './ContactForm'

const socialLinks = [
  { href: 'https://wa.me/', label: 'WhatsApp', icon: '/icons/ic_outline-whatsapp.svg' },
  { href: 'https://instagram.com/', label: 'Instagram', icon: '/icons/insagram.svg' },
  { href: 'https://facebook.com/', label: 'Facebook', icon: '/icons/facebook.svg' },
]

export function ContactDetails() {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h2 className="text-[32px] leading-[38px] text-[#110d0a]">Get In Touch</h2>
            <p className="max-w-[593px] text-base leading-[27px] text-[#6a6d70]">
              Whether you&apos;re ready to unwind or just have a question, we&apos;re here to help.
              Reach out to us and experience the beginning of your Royale relaxation journey.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex h-[51px] w-[51px] shrink-0 items-center justify-center rounded-full bg-[#b87333]">
              <Image src="/icons/mail.svg" alt="" width={22} height={22} />
            </span>
            <div>
              <p className="text-2xl text-[#110d0a]">Mail</p>
              <p className="text-base text-[#6a6d70]">info@royalerelax.co.uk</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex h-[51px] w-[51px] shrink-0 items-center justify-center rounded-full bg-[#b87333]">
              <Image src="/icons/phone.svg" alt="" width={22} height={22} />
            </span>
            <div>
              <p className="text-2xl text-[#110d0a]">Phone</p>
              <p className="text-base text-[#6a6d70]">+44 7999 371906</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-2xl text-[#110d0a]">Follow Us</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#110d0a] transition-colors hover:bg-[#b87333]"
                >
                  <Image src={link.icon} alt="" width={20} height={20} className="invert" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}
