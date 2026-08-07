export interface FabricFamily {
  id: string
  slug: string
  name: string
  description: string
  heroImage: string
  colorways: FabricColorway[]
}

export interface FabricColorway {
  id: string
  familyId: string
  name: string
  hex: string
  swatchImage: string
  inStock: boolean
}
