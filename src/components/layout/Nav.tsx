'use client'

import Link from 'next/link'

interface NavLink {
  href: string
  label: string
}

const links: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/shop/beds', label: 'Beds' },
  { href: '/shop/mattresses', label: 'Mattresses' },
  { href: '/shop/fabrics', label: 'Fabric Sample' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
]

export function Nav({ overlay }: { overlay?: boolean }) {
  return (
    <nav className="flex items-center gap-0.5 rounded-full bg-black/[0.08] px-6 py-2 transition-colors duration-300 ease-out">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 ease-out ${
            overlay
              ? 'text-white/90 hover:bg-white/10 hover:text-white'
              : 'text-stone-700 hover:bg-black/5 hover:text-amber-600'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

export function MobileNav({ overlay, onNavigate }: { overlay?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={`px-2 py-3 text-base font-medium ${
            overlay ? 'text-white hover:text-amber-300' : 'text-stone-800 hover:text-amber-600'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
