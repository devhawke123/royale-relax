export type ProductCategory = 'bed' | 'mattress' | 'fabric'

export interface Product {
  id: string
  slug: string
  name: string
  category: ProductCategory
  shortDescription?: string
  description?: string
  basePrice?: number
  currency?: string
  images: string[]
  colors?: ProductColorway[]
  variants: ProductVariant[]
  hasStorage?: boolean
  hasDrawer?: boolean
  isFeatured?: boolean
  isBedOfTheWeek?: boolean
  isBestSeller?: boolean
  isNew?: boolean
  bestSellerRank?: number
  rating?: number
  reviewCount?: number
  createdAt: string
  updatedAt?: string
}

export interface ProductColorway {
  id: string
  name: string
  code?: string | null
  images: string[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  size?: string
  fabricColorwayId?: string
  price: number
  compareAtPrice?: number
  inStock: boolean
}

export interface Promotion {
  id: string
  title: string
  description: string
  discountPercent?: number
  startsAt: string
  endsAt: string
  productIds?: string[]
}
