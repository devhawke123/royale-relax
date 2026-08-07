import Image from 'next/image'

export function ContactHero() {
  return (
    <div className="relative h-[570px] w-full overflow-hidden sm:h-[500px] lg:h-[700px]">
      <div className="absolute inset-0 bg-[#110d0a]" />
      <Image
        src="/images/lifestyle/contact-us-hero.jpg"
        alt="Contact Royale Relax"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-4xl leading-tight font-normal tracking-wide text-[#fefefe] capitalize sm:text-5xl lg:text-[64px] lg:leading-[85px]">
          Contact Us
        </h1>
        <p className="max-w-2xl text-base leading-[30px] text-white/90 sm:text-[20px]">
          Talk to Us — The First Step to Your Royale Experience
        </p>
      </div>
    </div>
  )
}
