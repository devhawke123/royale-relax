import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getImageUrl } from '@/lib/media'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { Category, ProductStatus, AddonType } from '../../../../../../generated/prisma/enums'

const MAX_PAGE_SIZE = 100
const DEFAULT_PAGE_SIZE = 25

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  sizes: { orderBy: { sortOrder: 'asc' as const } },
  fabricColors: { orderBy: { sortOrder: 'asc' as const } },
}

export async function GET(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const url = new URL(request.url)
  const search = url.searchParams.get('search')?.trim() ?? ''
  const categoryParam = url.searchParams.get('category')
  const statusParam = url.searchParams.get('status')
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE))

  if (categoryParam && !(Object.values(Category) as string[]).includes(categoryParam)) {
    return NextResponse.json({ error: `Invalid category: ${categoryParam}` }, { status: 400 })
  }
  if (statusParam && !(Object.values(ProductStatus) as string[]).includes(statusParam)) {
    return NextResponse.json({ error: `Invalid status: ${statusParam}` }, { status: 400 })
  }

  const where = {
    deletedAt: null,
    ...(categoryParam ? { category: categoryParam as Category } : {}),
    ...(statusParam ? { status: statusParam as ProductStatus } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sizes: { some: { sku: { contains: search, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ])

  const rows = products.map((product) => {
    const mainImage = product.images.find((image) => image.isMain) ?? product.images[0]
    // Fabric products don't have ProductImage rows — fall back to the first colourway's photo.
    const fallbackImagePath = !mainImage ? product.fabricColors[0]?.imagePath : undefined
    const sku = product.sizes.find((size) => size.sku)?.sku ?? null
    const basePrice = Number(product.basePrice)
    const salePrice = product.salePrice ? Number(product.salePrice) : null
    const discountPercent =
      product.onSale && salePrice && basePrice > 0 ? Math.round((1 - salePrice / basePrice) * 100) : 0

    return {
      id: product.id,
      name: product.name,
      sku,
      image: mainImage ? getImageUrl(mainImage.path) : fallbackImagePath ? getImageUrl(fallbackImagePath) : null,
      basePrice,
      salePrice,
      onSale: product.onSale,
      discountPercent,
    }
  })

  return NextResponse.json({
    products: rows,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || 'product'
  let candidate = root
  let suffix = 1
  while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    suffix += 1
    candidate = `${root}-${suffix}`
  }
  return candidate
}

interface ImageInput {
  path: string
  isMain: boolean
  sortOrder: number
}

interface FabricColorInput {
  code: string
  colorName: string
  imagePath: string
  description?: string
  status?: 'ACTIVE' | 'DISCONTINUED'
  sortOrder: number
}

interface SizeInput {
  label: string
  priceModifier?: number
  priceOverride?: number | null
  sku?: string
  isAvailable?: boolean
  sortOrder: number
}

interface AddonOptionInput {
  label: string
  priceModifier?: number
  sortOrder: number
}

interface AddonInput {
  name: string
  type: 'TOGGLE' | 'SELECT' | 'TEXT_INPUT'
  price?: number
  noPrice?: number
  isRequired?: boolean
  sortOrder: number
  options?: AddonOptionInput[]
}

/** Shared by POST and PATCH: rejects malformed size/addon rows before anything touches the DB. */
function validateSizesAndAddons(
  sizeInputs: SizeInput[],
  addonInputs: AddonInput[],
): string | null {
  for (const size of sizeInputs) {
    if (!size.label?.trim()) return 'Each size needs a label'
  }

  for (const addon of addonInputs) {
    if (!addon.name?.trim()) return 'Each configuration group needs a name'
    if (!(Object.values(AddonType) as string[]).includes(addon.type)) {
      return `Invalid configuration type: ${addon.type}`
    }
    if (addon.type === 'SELECT') {
      const options = addon.options ?? []
      if (options.length === 0) return `"${addon.name}" needs at least one choice`
      for (const option of options) {
        if (!option.label?.trim()) return `Each choice in "${addon.name}" needs a label`
      }
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  let body: Record<string, unknown>
  try {
    body = ((await request.json()) ?? {}) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, sku, description, category, status, basePrice, onSale, salePrice, saleStartsAt, saleEndsAt, images, fabricColors, sizes, addons } =
    body

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!(Object.values(Category) as string[]).includes(category as string)) {
    return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 })
  }
  if (status !== undefined && !(Object.values(ProductStatus) as string[]).includes(status as string)) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
  }
  if (typeof basePrice !== 'number' || Number.isNaN(basePrice) || basePrice < 0) {
    return NextResponse.json({ error: 'basePrice must be a non-negative number' }, { status: 400 })
  }
  if (salePrice !== undefined && salePrice !== null && (typeof salePrice !== 'number' || Number.isNaN(salePrice) || salePrice < 0)) {
    return NextResponse.json({ error: 'salePrice must be a non-negative number' }, { status: 400 })
  }

  const fabricColorInputs = (fabricColors as FabricColorInput[] | undefined) ?? []
  if (fabricColorInputs.length > 0) {
    for (const color of fabricColorInputs) {
      if (!color.code?.trim() || !color.colorName?.trim() || !color.imagePath?.trim()) {
        return NextResponse.json({ error: 'Each color needs a code, name, and image' }, { status: 400 })
      }
    }
    const codes = fabricColorInputs.map((c) => c.code.trim())
    if (new Set(codes).size !== codes.length) {
      return NextResponse.json({ error: 'Color codes must be unique' }, { status: 400 })
    }
    const conflicting = await prisma.fabricColor.findFirst({ where: { code: { in: codes } }, select: { code: true } })
    if (conflicting) {
      return NextResponse.json({ error: `Color code "${conflicting.code}" is already used by another product` }, { status: 400 })
    }
  }

  const sizeInputs = (sizes as SizeInput[] | undefined) ?? []
  const addonInputs = (addons as AddonInput[] | undefined) ?? []
  const validationError = validateSizesAndAddons(sizeInputs, addonInputs)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const slug = await uniqueSlug(slugify(name))
  const imageInputs = (images as ImageInput[] | undefined) ?? []

  const created = await prisma.product.create({
    data: {
      name: name.trim(),
      slug,
      description: (description as string) ?? '',
      category: category as Category,
      status: (status as ProductStatus) ?? 'DRAFT',
      basePrice,
      onSale: Boolean(onSale),
      salePrice: salePrice ?? null,
      saleStartsAt: saleStartsAt ? new Date(saleStartsAt as string) : null,
      saleEndsAt: saleEndsAt ? new Date(saleEndsAt as string) : null,
      images: imageInputs.length
        ? { create: imageInputs.map((image) => ({ path: image.path, isMain: image.isMain, sortOrder: image.sortOrder })) }
        : undefined,
      // Configurations tab (sizes/addons) takes over from the single-SKU shortcut once
      // the admin has defined explicit sizes for the product.
      sizes: sizeInputs.length
        ? {
            create: sizeInputs.map((size, i) => ({
              label: size.label.trim(),
              priceModifier: size.priceModifier ?? 0,
              priceOverride: size.priceOverride ?? null,
              sku: size.sku?.trim() || null,
              isAvailable: size.isAvailable ?? true,
              sortOrder: i,
            })),
          }
        : typeof sku === 'string' && sku.trim()
          ? { create: [{ label: 'Standard', sku: sku.trim(), sortOrder: 0 }] }
          : undefined,
      addons: addonInputs.length
        ? {
            create: addonInputs.map((addon, i) => ({
              name: addon.name.trim(),
              type: addon.type as AddonType,
              price: addon.price ?? 0,
              noPrice: addon.noPrice ?? 0,
              isRequired: addon.isRequired ?? false,
              sortOrder: i,
              options: addon.options?.length
                ? {
                    create: addon.options.map((option, j) => ({
                      label: option.label.trim(),
                      priceModifier: option.priceModifier ?? 0,
                      sortOrder: j,
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
      fabricColors: fabricColorInputs.length
        ? {
            create: fabricColorInputs.map((color, i) => ({
              code: color.code.trim(),
              colorName: color.colorName.trim(),
              imagePath: color.imagePath,
              description: color.description ?? '',
              status: color.status ?? 'ACTIVE',
              sortOrder: i,
            })),
          }
        : undefined,
    },
  })

  if (created.category === 'FABRICS') {
    revalidateTag('fabric-catalog', { expire: 0 })
  }

  return NextResponse.json({ id: created.id }, { status: 201 })
}
