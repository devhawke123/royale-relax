import { prisma } from '@/lib/prisma'
import { finalPrice } from '@/lib/pricing'
import { Prisma } from '../../../generated/prisma/client'
import { AddonType } from '../../../generated/prisma/enums'

export type CartAddonSelection = {
  addonId: string
  selectedOptionId?: string
  textValue?: string
}

export type CartItem = {
  productId: string
  sizeId?: string
  fabricColorId?: string
  quantity: number
  selectedAddons?: CartAddonSelection[]
}

export type Cart = {
  items: CartItem[]
}

export type BillingDetails = {
  firstName: string
  lastName: string
  companyName?: string
  country: string
  address: string
  city: string
  county: string
  postcode: string
  phone: string
  email: string
  deliverToDifferentAddress?: boolean
  orderNotes?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  BEDS: 'Beds',
  MATTRESSES: 'Mattresses',
  FABRICS: 'Fabrics',
}

type ResolvedAddon = {
  addonName: string
  selectedLabel: string | null
  textValue: string | null
  priceAtOrder: Prisma.Decimal
}

type ResolvedLineItem = {
  productId: string
  productName: string
  productSlug: string
  categoryLabel: string
  sizeId: string | null
  sizeLabel: string | null
  fabricColorId: string | null
  fabricCode: string | null
  fabricName: string | null
  sku: string | null
  imagePath: string | null
  unitPrice: Prisma.Decimal // product+size price, per unit, before addons
  quantity: number
  addons: ResolvedAddon[]
  /** unitPrice + sum(addon prices), i.e. what one unit actually costs */
  perUnitPrice: Prisma.Decimal
  lineTotal: Prisma.Decimal
}

export class CheckoutError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CheckoutError'
    this.status = status
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RR-${timestamp}-${random}`
}

async function resolveCartItem(item: CartItem): Promise<ResolvedLineItem> {
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new CheckoutError(`Invalid quantity for product ${item.productId}`)
  }

  const product = await prisma.product.findUnique({
    where: { id: item.productId },
    include: {
      sizes: item.sizeId ? { where: { id: item.sizeId } } : false,
      addons: { include: { options: true } },
      images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }], take: 1 },
    },
  })

  if (!product || product.status !== 'PUBLISHED' || product.deletedAt) {
    throw new CheckoutError(`Product not found or unavailable: ${item.productId}`)
  }

  let sizeId: string | null = null
  let sizeLabel: string | null = null
  let sku: string | null = null
  let size: { priceModifier: Prisma.Decimal; priceOverride: Prisma.Decimal | null } = {
    priceModifier: new Prisma.Decimal(0),
    priceOverride: null,
  }

  if (item.sizeId) {
    const foundSize = product.sizes?.[0]
    if (!foundSize) {
      throw new CheckoutError(`Size not found: ${item.sizeId} for product ${item.productId}`)
    }
    sizeId = foundSize.id
    sizeLabel = foundSize.label
    sku = foundSize.sku
    size = foundSize
  }

  let fabricColorId: string | null = null
  let fabricCode: string | null = null
  let fabricName: string | null = null
  let fabricImagePath: string | null = null

  if (item.fabricColorId) {
    const fabricColor = await prisma.fabricColor.findUnique({ where: { id: item.fabricColorId } })
    if (!fabricColor || fabricColor.status !== 'ACTIVE') {
      throw new CheckoutError(`Fabric colour not found or unavailable: ${item.fabricColorId}`)
    }
    fabricColorId = fabricColor.id
    fabricCode = fabricColor.code
    fabricName = fabricColor.colorName
    fabricImagePath = fabricColor.imagePath
  }

  const unitPrice = finalPrice(product, size)

  const selectedAddons = item.selectedAddons ?? []
  const addonById = new Map(product.addons.map((addon) => [addon.id, addon]))
  const resolvedAddons: ResolvedAddon[] = []

  for (const selection of selectedAddons) {
    const addon = addonById.get(selection.addonId)
    if (!addon) {
      throw new CheckoutError(`Addon not found: ${selection.addonId} for product ${item.productId}`)
    }

    let selectedLabel: string | null = null
    let textValue: string | null = null
    let priceAtOrder = addon.price

    switch (addon.type) {
      case AddonType.TOGGLE:
        break

      case AddonType.SELECT: {
        if (!selection.selectedOptionId) {
          throw new CheckoutError(`Addon "${addon.name}" requires a selected option`)
        }
        const option = addon.options.find((opt) => opt.id === selection.selectedOptionId)
        if (!option) {
          throw new CheckoutError(
            `Addon option not found: ${selection.selectedOptionId} for addon ${addon.id}`,
          )
        }
        selectedLabel = option.label
        priceAtOrder = priceAtOrder.plus(option.priceModifier)
        break
      }

      case AddonType.TEXT_INPUT:
        textValue = selection.textValue?.trim() ?? null
        if (addon.isRequired && !textValue) {
          throw new CheckoutError(`Addon "${addon.name}" requires a text value`)
        }
        break
    }

    resolvedAddons.push({ addonName: addon.name, selectedLabel, textValue, priceAtOrder })
  }

  for (const addon of product.addons) {
    if (!addon.isRequired) continue
    const wasSelected = selectedAddons.some((selection) => selection.addonId === addon.id)
    if (!wasSelected) {
      throw new CheckoutError(`Required addon "${addon.name}" was not selected for product ${product.name}`)
    }
  }

  const addonsTotal = resolvedAddons.reduce(
    (sum, addon) => sum.plus(addon.priceAtOrder),
    new Prisma.Decimal(0),
  )
  const perUnitPrice = unitPrice.plus(addonsTotal)
  const lineTotal = perUnitPrice.times(item.quantity)

  return {
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    categoryLabel: CATEGORY_LABELS[product.category] ?? product.category,
    sizeId,
    sizeLabel,
    fabricColorId,
    fabricCode,
    fabricName,
    sku,
    imagePath: fabricImagePath ?? product.images[0]?.path ?? null,
    unitPrice,
    quantity: item.quantity,
    addons: resolvedAddons,
    perUnitPrice,
    lineTotal,
  }
}

export async function createOrderFromCart(cart: Cart, billingDetails: BillingDetails, customerId: string | null) {
  if (!cart.items || cart.items.length === 0) {
    throw new CheckoutError('Cart is empty')
  }

  const resolvedItems = await Promise.all(cart.items.map(resolveCartItem))

  const subtotal = resolvedItems.reduce((sum, item) => sum.plus(item.lineTotal), new Prisma.Decimal(0))
  const shippingFee = new Prisma.Decimal(0) // free delivery — see Setting-backed fee in a later phase
  const total = subtotal.plus(shippingFee)
  const orderNumber = generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      firstName: billingDetails.firstName,
      lastName: billingDetails.lastName,
      companyName: billingDetails.companyName ?? null,
      country: billingDetails.country,
      address: billingDetails.address,
      city: billingDetails.city,
      county: billingDetails.county,
      postcode: billingDetails.postcode,
      phone: billingDetails.phone,
      email: billingDetails.email,
      deliverToDifferentAddress: billingDetails.deliverToDifferentAddress ?? false,
      orderNotes: billingDetails.orderNotes ?? null,
      subtotal,
      shippingFee,
      total,
      items: {
        create: resolvedItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          categoryLabel: item.categoryLabel,
          sizeId: item.sizeId,
          sizeLabel: item.sizeLabel,
          fabricColorId: item.fabricColorId,
          fabricCode: item.fabricCode,
          fabricName: item.fabricName,
          sku: item.sku,
          imagePath: item.imagePath,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          addons: {
            create: item.addons.map((addon) => ({
              addonName: addon.addonName,
              selectedLabel: addon.selectedLabel,
              textValue: addon.textValue,
              priceAtOrder: addon.priceAtOrder,
            })),
          },
        })),
      },
    },
    include: {
      items: { include: { addons: true } },
    },
  })

  return order
}
