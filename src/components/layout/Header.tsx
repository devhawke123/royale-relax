'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Nav, MobileNav } from '@/components/layout/Nav'
import { useCart } from '@/lib/cart-context'

const SCROLL_THRESHOLD = 50

function Logo({ overlay }: { overlay?: boolean }) {
  if (overlay) {
    return (
      <Link href="/" className="flex items-center">
        <Image
          src="/icons/logo.svg"
          alt="Royale Relax"
          width={290}
          height={161}
          className="h-24 w-auto sm:h-28"
          priority
        />
      </Link>
    )
  }

  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center text-stone-900">
        <svg viewBox="0 0 44 44" fill="none" className="h-11 w-11" aria-hidden>
          <path
            d="M22 2L38 11V33L22 42L6 33V11L22 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <text
            x="22"
            y="28"
            textAnchor="middle"
            fill="currentColor"
            fontSize="16"
            fontWeight="600"
            fontFamily="serif"
          >
            R
          </text>
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-wide text-stone-900">ROYALE</span>
        <span className="text-xs tracking-[0.3em] text-stone-500">RELAX</span>
      </span>
    </Link>
  )
}

function IconButton({
  label,
  badge,
  overlay,
  children,
}: {
  label: string
  badge?: number
  overlay?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 ease-out ${
        overlay
          ? 'text-white hover:bg-white/10'
          : 'text-stone-700 hover:bg-black/5 hover:text-amber-600'
      }`}
    >
      {children}
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

// search.svg
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M20 20L15.8033 15.8033M18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C14.6421 18 18 14.6421 18 10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// heart.svg
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.624 4.42553C3.965 5.18353 2.75 6.98753 2.75 9.13853C2.75 11.3355 3.65 13.0295 4.938 14.4815C6.001 15.6775 7.287 16.6695 8.541 17.6355C8.83967 17.8655 9.13467 18.0949 9.426 18.3235C9.952 18.7385 10.421 19.1015 10.874 19.3665C11.327 19.6315 11.69 19.7515 12 19.7515C12.31 19.7515 12.674 19.6315 13.126 19.3665C13.579 19.1015 14.048 18.7385 14.574 18.3235C14.8653 18.0942 15.1603 17.8652 15.459 17.6365C16.713 16.6685 17.999 15.6775 19.062 14.4815C20.351 13.0295 21.25 11.3355 21.25 9.13853C21.25 6.98853 20.035 5.18353 18.376 4.42553C16.764 3.68853 14.598 3.88353 12.54 6.02253C12.47 6.09512 12.3862 6.15286 12.2934 6.19229C12.2006 6.23173 12.1008 6.25205 12 6.25205C11.8992 6.25205 11.7994 6.23173 11.7066 6.19229C11.6138 6.15286 11.53 6.09512 11.46 6.02253C9.402 3.88353 7.236 3.68853 5.624 4.42553ZM12 4.46153C9.688 2.39153 7.099 2.10153 5 3.06053C2.786 4.07553 1.25 6.42753 1.25 9.13953C1.25 11.8045 2.36 13.8385 3.817 15.4785C4.983 16.7915 6.41 17.8905 7.671 18.8605C7.95767 19.0805 8.233 19.2945 8.497 19.5025C9.01 19.9065 9.56 20.3365 10.117 20.6625C10.674 20.9885 11.31 21.2525 12 21.2525C12.69 21.2525 13.326 20.9875 13.883 20.6625C14.441 20.3365 14.99 19.9065 15.503 19.5025C15.767 19.2945 16.0423 19.0805 16.329 18.8605C17.589 17.8905 19.017 16.7905 20.183 15.4785C21.64 13.8385 22.75 11.8045 22.75 9.13953C22.75 6.42753 21.215 4.07553 19 3.06253C16.901 2.10253 14.312 2.39253 12 4.46153Z"
        fill="currentColor"
      />
    </svg>
  )
}

// carrier.svg
function CartIcon() {
  return (
    <svg viewBox="0 0 21 20" fill="none" className="h-5 w-5">
      <path
        d="M3.71446 2.75H18.0162C19.469 2.75 20.4947 4.08739 20.0353 5.38246L18.2617 10.3825C17.972 11.1991 17.1587 11.75 16.2427 11.75H5.08267M16.7125 14.75H7.38464C6.32547 14.75 5.42749 14.0181 5.2777 13.0328L5.08267 11.75L3.71446 2.75L3.67146 2.46716C3.52167 1.48186 2.62369 0.75 1.56452 0.75H0.75M16.7125 14.75C15.537 14.75 14.5842 15.6454 14.5842 16.75C14.5842 17.8546 15.537 18.75 16.7125 18.75C17.888 18.75 18.8408 17.8546 18.8408 16.75C18.8408 15.6454 17.888 14.75 16.7125 14.75ZM10.3275 16.75C10.3275 17.8546 9.37464 18.75 8.19916 18.75C7.02372 18.75 6.07083 17.8546 6.07083 16.75C6.07083 15.6454 7.02372 14.75 8.19916 14.75C9.37464 14.75 10.3275 15.6454 10.3275 16.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// No dedicated account icon shipped in /public/icons — placeholder person outline, styled to match the rest.
function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 20C5.68 16.5 8.5 14.5 12 14.5C15.5 14.5 18.32 16.5 19.5 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  // Only the beds *listing* routes have a hero banner behind the header —
  // the bed detail page (/shop/beds/[slug]) doesn't, so it must not get the
  // fixed/transparent overlay treatment (it would float over the gallery
  // with nothing behind it).
  const isBedsPage = pathname === '/shop/beds' || pathname === '/shop/beds/storage' || pathname === '/shop/beds/drawer'
  const isFabricsPage = pathname.startsWith('/shop/fabrics')
  const isMattressesPage = pathname.startsWith('/shop/mattresses')
  const isAboutPage = pathname.startsWith('/about')
  const isOverlayPage = isHome || isBedsPage || isFabricsPage || isMattressesPage || isAboutPage
  const { cartCount, wishlistCount } = useCart()
  const headerRef = useRef<HTMLElement>(null)

  // Publish the header's real rendered height as a CSS var so pages with a
  // hero banner behind the fixed/transparent header (e.g. Beds) can lay
  // content out relative to it without guessing pixel values.
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const setVar = () => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`)
    }

    setVar()
    const observer = new ResizeObserver(setVar)
    observer.observe(el)
    return () => observer.disconnect()
  }, [menuOpen])

  useEffect(() => {
    if (!isOverlayPage) return

    let ticking = false
    const update = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD)
      ticking = false
    }

    if (isHome) {
      update()
    } else {
      setScrolled(false)
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isOverlayPage, isHome])

  // True only while sitting transparent over the hero.
  const transparent = isOverlayPage && !scrolled

  return (
    <>
      <header
        ref={headerRef}
        className={
          isOverlayPage
            ? `fixed inset-x-0 top-0 z-50 overflow-hidden transition-[background-color,box-shadow] duration-300 ease-out ${
                transparent ? 'bg-transparent' : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              }`
            : 'sticky top-0 z-50 bg-white shadow-sm'
        }
      >
      <div className="bg-[#B87333] text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-2 text-sm xl:px-8 2xl:max-w-[1600px] 2xl:px-12">
          <div className="flex items-center gap-6">
            <a
              href="mailto:info@royalerelax.co.uk"
              className="flex items-center gap-2 hover:opacity-90"
            >
              <Image
                src="/icons/mail.svg"
                alt="Email"
                width={16}
                height={16}
                className="h-4 w-4 shrink-0"
              />
              info@royalerelax.co.uk
            </a>
            <a
              href="tel:+447999371906"
              className="hidden items-center gap-2 hover:opacity-90 sm:flex"
            >
              <Image
                src="/icons/phone-svgrepo-com 1.svg"
                alt="Phone"
                width={16}
                height={16}
                className="h-4 w-4 shrink-0"
              />
              +44 7999 371906
            </a>
          </div>
          <span>United Kingdom</span>
        </div>
      </div>

      <div className={transparent ? '' : 'border-b border-stone-200'}>
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 xl:px-8 2xl:max-w-[1600px] 2xl:px-12">
          <Logo overlay={transparent} />

          <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <Nav overlay={transparent} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-black/[0.08] px-6 py-2 transition-colors duration-300 ease-out">
              <IconButton label="Search" overlay={transparent}>
                <SearchIcon />
              </IconButton>
              <IconButton label="Account" overlay={transparent}>
                <AccountIcon />
              </IconButton>
              <IconButton label="Wishlist" badge={wishlistCount} overlay={transparent}>
                <HeartIcon />
              </IconButton>
              <IconButton label="Cart" badge={cartCount} overlay={transparent}>
                <CartIcon />
              </IconButton>
            </div>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={`ml-1 flex h-9 w-9 items-center justify-center rounded-full lg:hidden ${
                transparent ? 'text-white hover:bg-white/10' : 'text-stone-700 hover:bg-stone-100'
              }`}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className={`border-b px-6 py-4 lg:hidden ${
            transparent ? 'border-white/20 bg-stone-950/95 text-white' : 'border-stone-200 bg-white'
          }`}
        >
          <MobileNav overlay={transparent} onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </header>

  </>)
}
