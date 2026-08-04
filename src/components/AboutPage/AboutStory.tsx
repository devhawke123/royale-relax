import Image from 'next/image'

export function AboutStory() {
  return (
    <section className="bg-[#f9f9f9] px-6 py-16 xl:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-2xl font-normal text-[#9d6026] capitalize">About Us</p>
          <h2 className="mt-2 text-2xl font-normal text-[#110d0a] capitalize sm:text-3xl">
            Crafted for Those Who Settle for Nothing Less.
          </h2>
          <p className="mt-6 text-lg leading-[27px] text-[#757575]">
            Royale Relax redefines luxury sleep through masterful craftsmanship rooted in
            Yorkshire, UK. Operating exclusively online, we remove the middle ground to bring
            finely crafted beds and mattresses straight to your home, where heritage design meets
            modern sleep technology.
          </p>
          <p className="mt-4 text-lg leading-[27px] text-[#757575]">
            Every creation is shaped by expert hands and built with carefully selected,
            sustainable materials to deliver superior comfort, dependable support, and long-term
            performance. From indulgently comfortable mattresses to beautifully tailored bed
            frames, our designs are made to enhance both rest and interiors. By blending
            traditional skills with forward-thinking innovation, we create sleep solutions that go
            beyond aesthetics to elevate everyday living.
          </p>
          <p className="mt-4 text-lg leading-[27px] text-[#757575]">
            Why compromise when exceptional sleep is within reach? Royale Relax welcomes those who
            value quality, detail, and comfort above all else. Enjoy free delivery across the UK
            and experience a higher standard of rest—because true luxury begins with how well you
            sleep.
          </p>
        </div>

        <div className="relative aspect-[827/553] w-full overflow-hidden rounded-2xl bg-stone-200">
          <Image
            src="/images/lifestyle/about-us-story.png"
            alt="Handcrafted Royale Relax bed"
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
