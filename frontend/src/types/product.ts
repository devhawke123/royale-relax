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
  variants: ProductVariant[]
  addons?: ProductAddon[]
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

export type ProductAddonType = 'TOGGLE' | 'SELECT' | 'TEXT_INPUT'

/**
 * Admin-configurable option group on a product (e.g. "Delivery Service",
 * "Choose Headboard Height"). SELECT groups render as a dropdown of
 * `options`; TOGGLE groups render as a Yes/No dropdown charging `price` for
 * "Yes" and `noPrice` for "No"; TEXT_INPUT groups collect free text with no
 * price impact.
 */
export interface ProductAddon {
  id: string
  name: string
  type: ProductAddonType
  price: number
  noPrice: number
  isRequired: boolean
  options: ProductAddonOption[]
}

export interface ProductAddonOption {
  id: string
  label: string
  priceModifier: number
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
