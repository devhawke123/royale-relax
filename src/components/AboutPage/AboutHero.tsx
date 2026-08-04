import Image from 'next/image'

export function AboutHero() {
  return (
    <div className="relative h-[380px] w-full overflow-hidden sm:h-[440px] lg:h-[500px]">
      <div className="absolute inset-0 bg-black/30" />
      <Image
        src="/images/lifestyle/about-us.svg"
        alt="About Royale Relax"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover object-center opacity-90"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-4xl font-normal tracking-wide text-[#fefefe] capitalize sm:text-5xl lg:text-[56px]">
          About Us
        </h1>
        <p className="max-w-2xl text-base text-white/90 sm:text-lg">
          Experience handcrafted excellence, tailored to deliver unparalleled comfort.
        </p>
      </div>
    </div>
  )
}
