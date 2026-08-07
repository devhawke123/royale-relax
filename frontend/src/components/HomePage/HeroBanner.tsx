import Image from 'next/image'
import Link from 'next/link'
import { HeroStats } from '@/components/HomePage/HeroStats'

interface HeroBannerProps {
  eyebrow: string
  titleLine1: string
  titleLine2: string
  description: string
  image: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}

function FeatureCallout({
  icon,
  title,
  subtitle,
}: {
  icon: string
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Image src={icon} alt="" width={36} height={36} className="h-9 w-9 shrink-0" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs leading-snug text-white/70">{subtitle}</p>
      </div>
    </div>
  )
}

export function HeroBanner({
  eyebrow,
  titleLine1,
  titleLine2,
  description,
  image,
  primaryCta,
  secondaryCta,
}: HeroBannerProps) {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden bg-stone-900">
      <Image src={image} alt="" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-950/35 to-stone-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-stone-950/20" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-3.5 px-6 pt-32 pb-10 sm:gap-4 sm:pt-36 sm:pb-12 lg:gap-5 xl:px-8 2xl:max-w-[1600px] 2xl:px-12">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-medium tracking-wide text-stone-800">
          <Image
            src="/icons/premium-sleep-collec.svg"
            alt=""
            width={16}
            height={16}
            className="h-3.5 w-3.5"
            aria-hidden
          />
          {eyebrow}
        </span>

        <h1 className="max-w-2xl text-4xl leading-[1.08] font-normal text-[#C4894A] sm:text-5xl lg:text-[3.25rem] 2xl:max-w-3xl 2xl:text-6xl">
          <span>{titleLine1}</span>
          <br />
          <span className="italic">{titleLine2}</span>
        </h1>

        <p className="max-w-lg text-sm leading-relaxed text-white/85 sm:text-[15px]">
          {description}
        </p>

        <div className="flex flex-wrap gap-5 sm:gap-8">
          <FeatureCallout
            icon="/icons/premium.svg"
            title="Premium Craftsmanship"
            subtitle="Handmade with care"
          />
          <FeatureCallout
            icon="/icons/sleepwell.svg"
            title="Sleep Guarantee"
            subtitle="Find your perfect rest, guaranteed"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={primaryCta.href}
            className="inline-flex items-center gap-2 rounded-md bg-[#B87333] px-5 py-2.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#a3662e]"
          >
            {primaryCta.label}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={secondaryCta.href}
            className="inline-flex items-center rounded-md border border-white/80 px-5 py-2.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
          >
            {secondaryCta.label}
          </Link>
        </div>

        <HeroStats />
      </div>
    </section>
    // commentssss

  )
}
