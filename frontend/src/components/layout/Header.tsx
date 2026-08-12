'use client'

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Nav, MobileNav } from '@/components/layout/Nav'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import type { Product } from '@/types/product'

function hrefForProduct(product: Product) {
  const section =
    product.category === 'mattress' ? 'mattresses' : product.category === 'fabric' ? 'fabrics' : 'beds'
  return `/shop/${section}/${product.slug}`
}

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
  href,
  pressed,
  onClick,
  children,
}: {
  label: string
  badge?: number
  overlay?: boolean
  href?: string
  pressed?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  const className = `relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 ease-out ${
    overlay ? 'text-white hover:bg-white/10' : 'text-stone-700 hover:bg-black/5 hover:text-amber-600'
  } ${pressed ? (overlay ? 'bg-white/10' : 'bg-black/5 text-amber-600') : ''}`
  const badgeEl = typeof badge === 'number' && badge > 0 && (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
      {badge}
    </span>
  )

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {children}
        {badgeEl}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={onClick ? pressed : undefined}
      onClick={onClick}
      className={className}
    >
      {children}
      {badgeEl}
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

/**
 * Rendered via a portal into document.body so it's never clipped by the
 * header's `overflow-hidden` (needed on transparent/overlay pages) — position
 * is computed from the search icon's own bounding rect instead of relying on
 * CSS anchoring through an ancestor.
 */
function SearchPopover({
  anchorRef,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
}) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = value.trim()
    if (!term) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { results: Product[] }) => setResults(data.results ?? []))
        .catch((err) => {
          if (err.name !== 'AbortError') setResults([])
        })
        .finally(() => setLoading(false))
    }, 250)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [value])

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    setCoords({ top: rect.bottom + 12, right: window.innerWidth - rect.right })
  }, [anchorRef])

  useEffect(() => {
    inputRef.current?.focus()

    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', onClose, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', onClose)
    }
  }, [onClose, anchorRef])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onClose()
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  if (!coords) return null

  return createPortal(
    <div
      ref={containerRef}
      style={{ top: coords.top, right: coords.right }}
      className="fixed z-[60] w-[calc(100vw-3rem)] max-w-[340px] rounded-[14px] border border-stone-200 bg-white p-2 shadow-xl"
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5">
        <span className="text-stone-400">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search beds, mattresses..."
          className="w-full bg-transparent text-[14px] text-stone-900 outline-none placeholder:text-stone-400"
        />
      </form>

      {value.trim() !== '' && (
        <div className="mt-2 max-h-[360px] overflow-y-auto">
          {loading ? (
            <p className="px-3 py-4 text-center text-[13px] text-stone-400">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-center text-[13px] text-stone-400">No results found.</p>
          ) : (
            <ul className="flex flex-col">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={hrefForProduct(product)}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-stone-50"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] text-stone-900">
                      {product.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>,
    document.body,
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
  const [searchOpen, setSearchOpen] = useState(false)
  const searchAnchorRef = useRef<HTMLDivElement>(null)
  const accountAnchorRef = useRef<HTMLDivElement>(null)
  const { status } = useAuth()
  const pathname = usePathname()
  const isHome = pathname === '/'
  // Only the beds *listing* routes have a hero banner behind the header —
  // the bed detail page (/shop/beds/[slug]) doesn't, so it must not get the
  // fixed/transparent overlay treatment (it would float over the gallery
  // with nothing behind it).
  const isBedsPage = pathname === '/shop/beds' || pathname === '/shop/beds/storage' || pathname === '/shop/beds/drawer'
  // Like isBedsPage/isMattressesPage above: only the fabrics *listing* has a
  // hero banner behind the header. The fabric detail page
  // (/shop/fabrics/[slug]) doesn't, so it must render the normal solid
  // header, not the fixed transparent overlay (which would float over the
  // gallery with nothing behind it).
  const isFabricsPage = pathname === '/shop/fabrics'
  // Like isBedsPage above: only the mattresses *listing* has a hero banner
  // behind the header. The mattress detail page (/shop/mattresses/[slug])
  // doesn't, so it must render the normal solid header, not the fixed
  // transparent overlay (which would float over the gallery with nothing
  // behind it).
  const isMattressesPage = pathname === '/shop/mattresses'
  const isAboutPage = pathname.startsWith('/about')
  const isContactPage = pathname.startsWith('/contact')
  const isOverlayPage =
    isHome || isBedsPage || isFabricsPage || isMattressesPage || isAboutPage || isContactPage
  const { cartCount } = useCart()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setSearchOpen(false)
  }, [pathname])

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

  // True whenever this page has a hero banner behind the header. The header
  // is `absolute`, not `fixed`, so it scrolls away with the page naturally —
  // no scroll-tracked color swap needed.
  const transparent = isOverlayPage

  return (
    <>
      <header
        ref={headerRef}
        className={
          isOverlayPage
            ? 'absolute inset-x-0 top-0 z-50 overflow-hidden bg-transparent'
            : 'relative z-50 bg-white shadow-sm'
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
                src="/icons/phone.svg"
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
              <div ref={searchAnchorRef}>
                <IconButton
                  label={searchOpen ? 'Close search' : 'Search'}
                  overlay={transparent}
                  pressed={searchOpen}
                  onClick={() => setSearchOpen((open) => !open)}
                >
                  <SearchIcon />
                </IconButton>
                {searchOpen && (
                  <SearchPopover anchorRef={searchAnchorRef} onClose={() => setSearchOpen(false)} />
                )}
              </div>
              <div ref={accountAnchorRef}>
                <IconButton
                  label={status === 'authenticated' ? 'Account' : 'Sign in'}
                  overlay={transparent}
                  href={status === 'authenticated' ? '/account' : '/login'}
                >
                  <AccountIcon />
                </IconButton>
              </div>
              <IconButton label="Cart" badge={cartCount} overlay={transparent} href="/cart">
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
    </>
  )
}
