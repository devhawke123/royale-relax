import Image from 'next/image'

export function AboutStory() {
  return (
    <section className="relative overflow-x-hidden bg-[#f9f9f9] py-50 lg:py-[50px]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-20">
        <div className="flex flex-col gap-7 lg:max-w-[690px]">
          <div className="flex flex-col gap-2.5">
            <p className="text-2xl font-normal text-[#9d6026] capitalize">About Us</p>
            <p className="text-2xl font-normal text-[#110d0a] capitalize">
              Crafted for Those Who Settle for Nothing Less.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-[20px] leading-[27px] text-[#757575]">
            <p>
              Royale Relax redefines luxury sleep through masterful craftsmanship rooted in
              Yorkshire, UK. Operating exclusively online, we remove the middle ground to bring
              finely crafted beds and mattresses straight to your home, where heritage design
              meets modern sleep technology.
            </p>
            <p>
              Every creation is shaped by expert hands and built with carefully selected,
              sustainable materials to deliver superior comfort, dependable support, and
              long-term performance. From indulgently comfortable mattresses to beautifully
              tailored bed frames, our designs are made to enhance both rest and interiors. By
              blending traditional skills with forward-thinking innovation, we create sleep
              solutions that go beyond aesthetics to elevate everyday living.
            </p>
            <p>
              Why compromise when exceptional sleep is within reach? Royale Relax welcomes those
              who value quality, detail, and comfort above all else. Enjoy free delivery across
              the UK and experience a higher standard of rest—because true luxury begins with how
              well you sleep.
            </p>
          </div>
        </div>

        <div className="relative hidden aspect-[827/553] lg:block" />
      </div>

      <div className="absolute right-0 bottom-0 hidden aspect-[827/553] w-[calc(55%-2rem)] translate-x-20 overflow-hidden lg:block">
        <Image
          src="/images/lifestyle/about-us-bed2.svg"
          alt="Handcrafted Royale Relax bed"
          fill
          unoptimized
          sizes="50vw"
          className="object-[30%_center]"
        />
      </div>

      <div className="relative mt-10 aspect-[600/500] w-full overflow-hidden px-6 sm:px-10 lg:hidden">
        <Image
          src="/images/lifestyle/about-us-bed2.svg"
          alt="Handcrafted Royale Relax bed"
          fill
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}
