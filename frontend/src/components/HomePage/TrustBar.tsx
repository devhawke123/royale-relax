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
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-6 py-8 sm:grid-cols-3 sm:py-10 xl:px-8">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
          >
            <Image
              src={item.icon}
              alt=""
              width={72}
              height={72}
              className="h-16 w-16 shrink-0 object-contain"
            />
            <div>
              <p className="font-bold text-[#222]">{item.title}</p>
              <p className="text-sm text-[#222]">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
