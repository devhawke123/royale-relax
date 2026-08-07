import type { FabricFamily } from '@/types/fabric'

export const mockFabricFamilies: FabricFamily[] = [
  {
    id: 'fam-1',
    slug: 'boucle',
    name: 'Bouclé',
    description: 'A looped, textured weave that feels soft and lived-in from day one.',
    heroImage: '/images/fabrics/boucle-hero.jpg',
    colorways: [
      {
        id: 'col-1',
        familyId: 'fam-1',
        name: 'Oatmeal',
        hex: '#E4DCCB',
        swatchImage: '/images/fabrics/boucle-oatmeal.jpg',
        inStock: true,
      },
      {
        id: 'col-2',
        familyId: 'fam-1',
        name: 'Slate',
        hex: '#6E7276',
        swatchImage: '/images/fabrics/boucle-slate.jpg',
        inStock: true,
      },
    ],
  },
  {
    id: 'fam-2',
    slug: 'linen',
    name: 'Linen Blend',
    description: 'Breathable and relaxed, with a natural slub texture.',
    heroImage: '/images/fabrics/linen-hero.jpg',
    colorways: [
      {
        id: 'col-3',
        familyId: 'fam-2',
        name: 'Sand',
        hex: '#D8C9AE',
        swatchImage: '/images/fabrics/linen-sand.jpg',
        inStock: true,
      },
      {
        id: 'col-4',
        familyId: 'fam-2',
        name: 'Sage',
        hex: '#A9B39A',
        swatchImage: '/images/fabrics/linen-sage.jpg',
        inStock: false,
      },
    ],
  },
  {
    id: 'fam-3',
    slug: 'velvet',
    name: 'Velvet',
    description: 'A rich, plush pile with a soft sheen.',
    heroImage: '/images/fabrics/velvet-hero.jpg',
    colorways: [
      {
        id: 'col-5',
        familyId: 'fam-3',
        name: 'Emerald',
        hex: '#2F5D50',
        swatchImage: '/images/fabrics/velvet-emerald.jpg',
        inStock: true,
      },
      {
        id: 'col-6',
        familyId: 'fam-3',
        name: 'Ink',
        hex: '#1D1F26',
        swatchImage: '/images/fabrics/velvet-ink.jpg',
        inStock: true,
      },
    ],
  },
]
