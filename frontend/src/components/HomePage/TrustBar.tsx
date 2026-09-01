import Image from 'next/image'

interface TrustBarItem {
  icon: string
  title: string
  subtitle: string
}

interface TrustBarProps {
  items: TrustBarItem[]
}

export function TrustBar({ items }: TrustBarProps) {
  return (
    <section className="bg-[#f5f5f5]">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-6 py-8 sm:gap-8 md:grid-cols-3 md:py-10 xl:px-8">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-row items-center justify-center gap-3 text-left sm:justify-start"
          >
            <Image
              src={item.icon}
              alt=""
              width={72}
              height={72}
              className="h-16 w-16 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="font-bold text-[#222]">{item.title}</p>
              <p className="text-sm text-[#222]">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
