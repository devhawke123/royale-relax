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
  { href: '/account/orders', label: 'Track Your Order' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy Policy' },
]

export function Footer() {
  return (
    <footer className="bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 xl:px-8">
        <Link href="/" className="flex items-center">
          <Image src="/icons/footer-logo.svg" alt="Royale Relax" width={130} height={54} />
        </Link>

        <div className="mt-10 grid gap-10 border-t border-stone-300 pt-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h3 className="text-lg text-[#6a6d70]">Our Newsletter</h3>
            <form className="mt-6 flex max-w-xs items-center gap-2 rounded-full border border-[#6a6d70] px-4 py-2.5">
              <span aria-hidden className="text-[#6a6d70]">
                👤
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent text-sm text-[#6a6d70] outline-none placeholder:text-[#6a6d70]"
                disabled
              />
            </form>
          </div>

          <div>
            <h3 className="text-lg text-[#6a6d70]">Shop Highlights</h3>
            <ul className="mt-6 space-y-2 text-sm text-[#6a6d70]">
              {shopHighlights.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-amber-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg text-[#6a6d70]">Quick Links</h3>
            <ul className="mt-6 space-y-2 text-sm text-[#6a6d70]">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-amber-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg text-[#6a6d70]">Customer Services</h3>
            <ul className="mt-6 space-y-2 text-sm text-[#6a6d70]">
              {customerServices.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-amber-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg text-[#6a6d70]">Contact Info</h3>
            <ul className="mt-6 space-y-2 text-sm text-[#6a6d70]">
              <li>Phone: +44 7999 371906</li>
              <li>Address: United Kingdom</li>
              <li>Email: info@royalerelax.co.uk</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-stone-300 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-[#6a6d70]">
            © Copyright {new Date().getFullYear()} - Design &amp; Developed by Royale Relax
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efefef] transition-colors hover:bg-stone-200"
            >
              <Image src="/icons/ic_outline-whatsapp.svg" alt="WhatsApp" width={24} height={24} />
            </Link>
            <Link
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efefef] transition-colors hover:bg-stone-200"
            >
              <Image src="/icons/insagram.svg" alt="Instagram" width={24} height={24} />
            </Link>
            <Link
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efefef] transition-colors hover:bg-stone-200"
            >
              <Image src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
