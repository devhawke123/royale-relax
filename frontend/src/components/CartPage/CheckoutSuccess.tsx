import Image from 'next/image'
import Link from 'next/link'

export function CheckoutSuccess() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-24 text-center">
      <Image
        src="/icons/payment-success-tick.svg"
        alt=""
        width={237}
        height={237}
        className="h-32 w-32 sm:h-40 sm:w-40"
      />
      <h1 className="text-[32px] font-medium text-black sm:text-[48px]">Payment Successful</h1>
      <p className="text-[22px] text-black sm:text-[40px]">Your order has been confirmed</p>
      <Link
        href="/"
        className="mt-2 flex h-[60px] w-[260px] items-center justify-center rounded-[19px] bg-black/[0.88] text-[18px] font-medium text-white transition-colors hover:bg-black sm:h-[80px] sm:w-[309px] sm:text-[24px]"
      >
        Continue shopping
      </Link>
    </main>
  )
}
