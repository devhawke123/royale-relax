import type { Testimonial } from '@/types/testimonial'

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Josh H.',
    role: 'Customer',
    quote:
      'Absolutely love the quality and style of the furniture. It fits perfectly with my space and feels incredibly comfortable. The service was top-notch from start to finish!',
    rating: 5,
    avatar: '/images/lifestyle/Josh_Review.jpg',
  },
  {
    id: 'test-2',
    name: 'Emily Tan',
    role: 'Customer',
    quote:
      'The bed feels like it was made for our exact room — the fabric options made the whole process feel personal.',
    rating: 5,
    avatar: '/images/lifestyle/emilu_review.jpg',
  },
  {
    id: 'test-3',
    name: 'Michael Rivera',
    role: 'Customer',
    quote:
      'Best sleep we have had in years — the mattress is a game changer and delivery was effortless.',
    rating: 5,
    avatar: '/images/lifestyle/michael_review.jpg',
  },
]
