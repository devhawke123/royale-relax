import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getImageUrl } from '@/lib/media'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { Category, ProductStatus, AddonType } from '../../../../../../generated/prisma/enums'

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  sizes: { orderBy: { sortOrder: 'asc' as const } },
  fabricColors: { orderBy: { sortOrder: 'asc' as const } },
  addons: {
    orderBy: { sortOrder: 'asc' as const },
    include: { options: { orderBy: { sortOrder: 'asc' as const } } },
  },
}

function serialize(
  product: NonNullable<Awaited<ReturnType<typeof loadProduct>>>,
) {
  const mainImage = product.images.find((image) => image.isMain) ?? product.images[0]
  // Fabric products don't carry ProductImage rows — each colourway has its own
  // photo instead, so fall back to the first colour's image for the preview.
  const fallbackImagePath = !mainImage ? product.fabricColors[0]?.imagePath : undefined
  const sku = product.sizes.find((size) => size.sku)?.sku ?? null

  return {
    id: product.id,
    name: product.name,
    sku,
    description: product.description,
    category: product.category,
    status: product.status,
    basePrice: Number(product.basePrice),
    onSale: product.onSale,
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    saleStartsAt: product.saleStartsAt ? product.saleStartsAt.toISOString().slice(0, 10) : null,
    saleEndsAt: product.saleEndsAt ? product.saleEndsAt.toISOString().slice(0, 10) : null,
    mainImage: mainImage ? getImageUrl(mainImage.path) : fallbackImagePath ? getImageUrl(fallbackImagePath) : null,
    images: product.images.map((image) => ({
      id: image.id,
      path: image.path,
      url: getImageUrl(image.path),
      isMain: image.isMain,
      sortOrder: image.sortOrder,
    })),
    fabricColors: product.fabricColors.map((color) => ({
      id: color.id,
      code: color.code,
      colorName: color.colorName,
      imagePath: color.imagePath,
      imageUrl: getImageUrl(color.imagePath),
      description: color.description,
      status: color.status,
      sortOrder: color.sortOrder,
    })),
    sizes: product.sizes.map((size) => ({
      id: size.id,
      label: size.label,
      priceModifier: Number(size.priceModifier),
      priceOverride: size.priceOverride !== null ? Number(size.priceOverride) : null,
      sku: size.sku,
      isAvailable: size.isAvailable,
      sortOrder: size.sortOrder,
    })),
    addons: product.addons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      type: addon.type,
      price: Number(addon.price),
      noPrice: Number(addon.noPrice),
      isRequired: addon.isRequired,
      sortOrder: addon.sortOrder,
      options: addon.options.map((option) => ({
        id: option.id,
        label: option.label,
        priceModifier: Number(option.priceModifier),
        sortOrder: option.sortOrder,
      })),
    })),
  }
}

function loadProduct(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: productInclude,
  })
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const { id } = await params
  const product = await loadProduct(id)
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product: serialize(product) })
}

interface ImageInput {
  id?: string
  path: string
  isMain: boolean
  sortOrder: number
}

interface FabricColorInput {
  id?: string
  code: string
  colorName: string
  imagePath: string
  description?: string
  status?: 'ACTIVE' | 'DISCONTINUED'
  sortOrder: number
}

interface SizeInput {
  id?: string
  label: string
  priceModifier?: number
  priceOverride?: number | null
  sku?: string
  isAvailable?: boolean
  sortOrder: number
}

interface AddonOptionInput {
  id?: string
  label: string
  priceModifier?: number
  sortOrder: number
}

interface AddonInput {
  id?: string
  name: string
  type: 'TOGGLE' | 'SELECT' | 'TEXT_INPUT'
  price?: number
  noPrice?: number
  isRequired?: boolean
  sortOrder: number
  options?: AddonOptionInput[]
}

/** Shared shape with the create route: rejects malformed size/addon rows before anything touches the DB. */
function validateSizesAndAddons(sizeInputs: SizeInput[], addonInputs: AddonInput[]): string | null {
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const { id } = await params
  const existing = await loadProduct(id)
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = ((await request.json()) ?? {}) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, description, category, status, basePrice, onSale, salePrice, saleStartsAt, saleEndsAt, images, fabricColors, sizes, addons } =
    body

  if (category !== undefined && !(Object.values(Category) as string[]).includes(category as string)) {
    return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 })
  }
  if (status !== undefined && !(Object.values(ProductStatus) as string[]).includes(status as string)) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
  }
  if (basePrice !== undefined && (typeof basePrice !== 'number' || Number.isNaN(basePrice) || basePrice < 0)) {
    return NextResponse.json({ error: 'basePrice must be a non-negative number' }, { status: 400 })
  }
  if (salePrice !== undefined && salePrice !== null && (typeof salePrice !== 'number' || Number.isNaN(salePrice) || salePrice < 0)) {
    return NextResponse.json({ error: 'salePrice must be a non-negative number' }, { status: 400 })
  }

  let fabricColorInputs: FabricColorInput[] | undefined
  if (fabricColors !== undefined) {
    fabricColorInputs = fabricColors as FabricColorInput[]
    for (const color of fabricColorInputs) {
      if (!color.code?.trim() || !color.colorName?.trim() || !color.imagePath?.trim()) {
        return NextResponse.json({ error: 'Each color needs a code, name, and image' }, { status: 400 })
      }
    }
    const codes = fabricColorInputs.map((c) => c.code.trim())
    if (new Set(codes).size !== codes.length) {
      return NextResponse.json({ error: 'Color codes must be unique' }, { status: 400 })
    }
    const conflicting = await prisma.fabricColor.findFirst({
      where: { code: { in: codes }, productId: { not: id } },
      select: { code: true },
    })
    if (conflicting) {
      return NextResponse.json({ error: `Color code "${conflicting.code}" is already used by another product` }, { status: 400 })
    }
  }

  const sizeInputs: SizeInput[] | undefined = sizes !== undefined ? (sizes as SizeInput[]) : undefined
  const addonInputs: AddonInput[] | undefined = addons !== undefined ? (addons as AddonInput[]) : undefined
  const validationError = validateSizesAndAddons(sizeInputs ?? [], addonInputs ?? [])
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name as string } : {}),
        ...(description !== undefined ? { description: description as string } : {}),
        ...(category !== undefined ? { category: category as Category } : {}),
        ...(status !== undefined ? { status: status as ProductStatus } : {}),
        ...(basePrice !== undefined ? { basePrice: basePrice as number } : {}),
        ...(onSale !== undefined ? { onSale: onSale as boolean } : {}),
        ...(salePrice !== undefined ? { salePrice: salePrice as number | null } : {}),
        ...(saleStartsAt !== undefined
          ? { saleStartsAt: saleStartsAt ? new Date(saleStartsAt as string) : null }
          : {}),
        ...(saleEndsAt !== undefined ? { saleEndsAt: saleEndsAt ? new Date(saleEndsAt as string) : null } : {}),
      },
    })

    if (images !== undefined) {
      const imageInputs = images as ImageInput[]
      await tx.productImage.deleteMany({ where: { productId: id } })
      if (imageInputs.length > 0) {
        await tx.productImage.createMany({
          data: imageInputs.map((image) => ({
            productId: id,
            path: image.path,
            isMain: image.isMain,
            sortOrder: image.sortOrder,
          })),
        })
      }
    }

    if (fabricColorInputs !== undefined) {
      await tx.fabricColor.deleteMany({ where: { productId: id } })
      if (fabricColorInputs.length > 0) {
        await tx.fabricColor.createMany({
          data: fabricColorInputs.map((color) => ({
            productId: id,
            code: color.code.trim(),
            colorName: color.colorName.trim(),
            imagePath: color.imagePath,
            description: color.description ?? '',
            status: color.status ?? 'ACTIVE',
            sortOrder: color.sortOrder,
          })),
        })
      }
    }

    if (sizeInputs !== undefined) {
      // Cascade-deletes any OrderItem.sizeId references (SetNull) — safe, since order
      // history keeps its own immutable sizeLabel snapshot independent of this row.
      await tx.productSize.deleteMany({ where: { productId: id } })
      if (sizeInputs.length > 0) {
        await tx.productSize.createMany({
          data: sizeInputs.map((size, i) => ({
            productId: id,
            label: size.label.trim(),
            priceModifier: size.priceModifier ?? 0,
            priceOverride: size.priceOverride ?? null,
            sku: size.sku?.trim() || null,
            isAvailable: size.isAvailable ?? true,
            sortOrder: i,
          })),
        })
      }
    }

    if (addonInputs !== undefined) {
      // Batched as two createMany calls (pre-generating ids client-side, same as
      // Prisma's own @default(uuid()) would) instead of one tx.productAddon.create()
      // per addon+options — a per-addon loop of individually awaited creates was
      // slow enough over the pooled connection to blow the 5s interactive
      // transaction timeout on products with many configuration groups.
      await tx.productAddon.deleteMany({ where: { productId: id } })
      if (addonInputs.length > 0) {
        const addonRows = addonInputs.map((addon, i) => ({
          id: randomUUID(),
          productId: id,
          name: addon.name.trim(),
          type: addon.type as AddonType,
          price: addon.price ?? 0,
          noPrice: addon.noPrice ?? 0,
          isRequired: addon.isRequired ?? false,
          sortOrder: i,
        }))
        await tx.productAddon.createMany({ data: addonRows })

        const optionRows = addonInputs.flatMap((addon, i) =>
          (addon.options ?? []).map((option, j) => ({
            id: randomUUID(),
            addonId: addonRows[i].id,
            label: option.label.trim(),
            priceModifier: option.priceModifier ?? 0,
            sortOrder: j,
          })),
        )
        if (optionRows.length > 0) {
          await tx.productAddonOption.createMany({ data: optionRows })
        }
      }
    }
  }, { timeout: 20000 })

  const updated = await loadProduct(id)

  if (existing.category === 'FABRICS' || updated?.category === 'FABRICS') {
    revalidateTag('fabric-catalog', { expire: 0 })
  }

  return NextResponse.json({ product: serialize(updated!) })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  const { id } = await params
  const existing = await loadProduct(id)
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } })

  if (existing.category === 'FABRICS') {
    revalidateTag('fabric-catalog', { expire: 0 })
  }

  return NextResponse.json({ ok: true })
}
