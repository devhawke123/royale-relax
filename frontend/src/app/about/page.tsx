import { AboutHero } from '@/components/AboutPage/AboutHero'
import { AboutStory } from '@/components/AboutPage/AboutStory'
import { WhyChooseRoyaleRelax } from '@/components/AboutPage/WhyChooseRoyaleRelax'

export const metadata = {
  title: 'About Us | Royale Relax',
  description:
    'Royale Relax is handcrafted luxury sleep, made in Yorkshire and delivered direct across the UK.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <AboutHero />
      <AboutStory />
      <WhyChooseRoyaleRelax />
    </main>
  )
}
