export function BrandStrip() {
  return (
    <section className="bg-[#f5f5f5] px-6 py-16 sm:py-20 xl:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div
          className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl px-8 py-7 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] sm:py-8"
          style={{
            background:
              'linear-gradient(90deg, #B87333 0%, #B87333 22%, #FAF5F5 51%, #B87333 78%, #B87333 100%)',
          }}
        >
          <p className="text-3xl font-semibold text-[#7D4614] sm:text-4xl lg:text-5xl">
            Royale Relax
          </p>
          <p className="mt-1 text-sm font-medium tracking-wide text-black/80 sm:text-base">
            The New Standard in Luxury Sleep
          </p>
        </div>
      </div>
    </section>
  )
}
