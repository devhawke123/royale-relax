import Link from 'next/link'
import { Button } from '@/components/ui/Button'

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
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-stone-900 text-lg font-semibold">
            R
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-wide text-stone-900">ROYALE</span>
            <span className="text-xs tracking-[0.3em] text-stone-500">RELAX</span>
          </span>
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
            <Button
              variant="secondary"
              className="rounded-full border-none bg-[#efefef] px-4 py-3 text-[#6a6d70] hover:bg-stone-200"
            >
              WhatsApp
            </Button>
            <Button
              variant="secondary"
              className="rounded-full border-none bg-[#efefef] px-4 py-3 text-[#6a6d70] hover:bg-stone-200"
            >
              Instagram
            </Button>
            <Button
              variant="secondary"
              className="rounded-full border-none bg-[#efefef] px-4 py-3 text-[#6a6d70] hover:bg-stone-200"
            >
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
