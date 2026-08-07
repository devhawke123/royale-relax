import { ContactHero } from '@/components/ContactPage/ContactHero'
import { ContactDetails } from '@/components/ContactPage/ContactDetails'
import { ContactFaq } from '@/components/ContactPage/ContactFaq'

export const metadata = {
  title: 'Contact Us | Royale Relax',
  description:
    'Talk to us — the first step to your Royale experience. Reach out for questions, orders, or support.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <ContactHero />
      <ContactDetails />
      <ContactFaq />
    </main>
  )
}
