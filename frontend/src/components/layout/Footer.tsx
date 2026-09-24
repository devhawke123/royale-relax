import Image from 'next/image'
import Link from 'next/link'

const shopHighlights = [
  { href: '/shop/mattresses', label: 'Mattresses' },
  { href: '/shop/beds', label: 'Storage Beds' },
  { href: '/shop/beds', label: 'Drawer Beds' },
  { href: '/shop/fabrics', label: 'Fabric Sample' },
]

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop/beds', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const customerServices = [
  { href: '/account', label: 'My Account' },
  { href: '/contact#faq', label: 'FAQ' },
]

const socials = [
  { href: 'https://wa.me/', label: 'WhatsApp', icon: '/icons/ic_outline-whatsapp.svg', size: 24 },
  { href: 'https://instagram.com/', label: 'Instagram', icon: '/icons/insagram.svg', size: 18 },
  { href: 'https://facebook.com/', label: 'Facebook', icon: '/icons/facebook.svg', size: 24 },
]

export function Footer({ phone, email }: { phone: string; email: string }) {
  return (
    <footer className="bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-7xl px-6 pt-6 xl:px-8 2xl:max-w-[1600px] 2xl:px-12">
        <Link href="/" className="inline-block">
          <Image
            src="/icons/dark-logo.svg"
            alt="Royale Relax"
            width={279}
            height={145}
            className="h-16 w-auto sm:h-20 lg:h-[104px]"
          />
        </Link>

        <div className="mt-6 grid gap-10 border-t border-[#d1d1d1] pt-8 lg:grid-cols-[293px_1fr] lg:gap-8">
          {/* Newsletter */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl text-[#6a6d70]">Our Newsletter</h3>
            <div className="flex items-center gap-2.5 rounded-full border border-[#6a6d70] px-6 py-3.5">
              <Image src="/icons/user.svg" alt="" width={20} height={20} className="shrink-0" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full min-w-0 bg-transparent text-sm text-[#6a6d70] outline-none placeholder:text-[#6a6d70]"
              />
            </div>
          </div>

          {/* Link columns — a plain 2-col grid below lg, then the exact
              fixed-width Figma layout once there's room for it (lg+). */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:flex lg:flex-nowrap lg:justify-between lg:gap-x-[75px] lg:gap-y-0">
            <div className="min-w-0 lg:w-[140px] lg:shrink-0">
              <h3 className="text-lg text-[#6a6d70] capitalize">Shop Highlights</h3>
              <ul className="mt-10 space-y-1.5 text-sm text-[#6a6d70]">
                {shopHighlights.map((link, index) => (
                  <li key={`${link.label}-${index}`}>
                    <Link href={link.href} className="hover:text-[#b87333]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 lg:w-[130px] lg:shrink-0">
              <h3 className="text-lg text-[#6a6d70] capitalize">Quick Links</h3>
              <ul className="mt-10 space-y-1.5 text-sm text-[#6a6d70]">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-[#b87333]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 lg:w-[156px] lg:shrink-0">
              <h3 className="text-lg text-[#6a6d70] capitalize">Customer Services</h3>
              <ul className="mt-10 space-y-1.5 text-sm text-[#6a6d70]">
                {customerServices.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-[#b87333]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 lg:w-[231px] lg:shrink-0">
              <h3 className="text-lg text-[#6a6d70] capitalize">Contact Info</h3>
              <ul className="mt-10 space-y-[7px] text-sm text-[#6a6d70] lg:whitespace-nowrap">
                <li>Phone: {phone}</li>
                <li>Address: United Kingdom</li>
                <li className="lowercase">Email: {email}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#d1d1d1]" />

        <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <p className="text-base text-[#6a6d70]">
            @Copyright {new Date().getFullYear()} - Design &amp; Developed by BlueHawke
          </p>
          <div className="flex flex-wrap items-center justify-center gap-[11px]">
            {socials.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[50px] items-center gap-2.5 rounded-[30px] bg-[#efefef] px-[17px] text-base text-[#6a6d70] transition-colors hover:bg-stone-200"
              >
                <Image src={social.icon} alt="" width={social.size} height={social.size} />
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
