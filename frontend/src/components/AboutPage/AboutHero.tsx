import Image from 'next/image'

export function AboutHero() {
  return (
    <div className="relative h-[400px] w-full overflow-hidden sm:h-[500px] lg:h-[700px]">
      <div className="absolute inset-0 bg-[#110d0a]" />
      <Image
        src="/images/lifestyle/about-us.svg"
        alt="About Royale Relax"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="origin-top scale-110 object-cover object-top opacity-50"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-4xl leading-tight font-normal tracking-wide text-[#fefefe] capitalize sm:text-5xl lg:text-[64px] lg:leading-[85px]">
          About Us
        </h1>
        <p className="max-w-2xl text-base leading-[30px] text-white/90 sm:text-[20px]">
          Experience handcrafted excellence, tailored to deliver unparalleled comfort.
        </p>
      </div>
    </div>
  )
}
