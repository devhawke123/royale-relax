import { prisma } from '@/lib/prisma'
import { finalPrice } from '@/lib/pricing'
import { Prisma } from '../../../generated/prisma/client'
import { AddonType, OrderStatus } from '../../../generated/prisma/enums'

export type CartAddonSelection = {
  addonId: string
  selectedOptionId?: string
  textValue?: string
}

export type CartItem = {
  productId: string
  sizeId?: string
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
  shippingFee?: number
}

type ResolvedLineItem = {
  productId: string
  productName: string
  sizeLabel: string | null
  unitPrice: number
  quantity: number
  addons: {
    addonName: string
    selectedLabel: string | null
    textValue: string | null
    priceAtOrder: number
  }[]
}

function decimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value)
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RR-${timestamp}-${random}`
}

async function resolveCartItem(item: CartItem): Promise<ResolvedLineItem> {
  const product = await prisma.product.findUnique({
    where: { id: item.productId },
    include: {
      sizes: item.sizeId ? { where: { id: item.sizeId } } : false,
      addons: {
        include: { options: true },
      },
    },
  })

  if (!product) {
    throw new Error(`Product not found: ${item.productId}`)
  }

  let sizeLabel: string | null = null
  let size: { priceModifier: Prisma.Decimal; priceOverride: Prisma.Decimal | null } = {
    priceModifier: new Prisma.Decimal(0),
    priceOverride: null,
  }

  if (item.sizeId) {
    const foundSize = product.sizes?.[0]
    if (!foundSize) {
      throw new Error(`Size not found: ${item.sizeId} for product ${item.productId}`)
    }
    sizeLabel = foundSize.label
    size = foundSize
  }

  const unitPrice = finalPrice(product, size).toNumber()

  const selectedAddons = item.selectedAddons ?? []
  const addonById = new Map(product.addons.map((addon) => [addon.id, addon]))
  const resolvedAddons: ResolvedLineItem['addons'] = []

  for (const selection of selectedAddons) {
    const addon = addonById.get(selection.addonId)
    if (!addon) {
      throw new Error(`Addon not found: ${selection.addonId} for product ${item.productId}`)
    }

    let selectedLabel: string | null = null
    let textValue: string | null = null
    let priceAtOrder = addon.price.toNumber()

    switch (addon.type) {
      case AddonType.TOGGLE:
        break

      case AddonType.SELECT: {
        if (!selection.selectedOptionId) {
          throw new Error(`Addon "${addon.name}" requires a selected option`)
        }
        const option = addon.options.find((opt) => opt.id === selection.selectedOptionId)
        if (!option) {
          throw new Error(
            `Addon option not found: ${selection.selectedOptionId} for addon ${addon.id}`,
          )
        }
        selectedLabel = option.label
        priceAtOrder += option.priceModifier.toNumber()
        break
      }

      case AddonType.TEXT_INPUT:
        textValue = selection.textValue?.trim() ?? null
        if (addon.isRequired && !textValue) {
          throw new Error(`Addon "${addon.name}" requires a text value`)
        }
        break
    }

    resolvedAddons.push({
      addonName: addon.name,
      selectedLabel,
      textValue,
      priceAtOrder,
    })
  }

  for (const addon of product.addons) {
    if (!addon.isRequired) {
      continue
    }

    const wasSelected = selectedAddons.some((selection) => selection.addonId === addon.id)
    if (!wasSelected) {
      throw new Error(`Required addon "${addon.name}" was not selected for product ${product.name}`)
    }
  }

  if (item.quantity < 1) {
    throw new Error(`Invalid quantity for product ${product.name}`)
  }

  return {
    productId: product.id,
    productName: product.name,
    sizeLabel,
    unitPrice,
    quantity: item.quantity,
    addons: resolvedAddons,
  }
}

export async function createOrderFromCart(cart: Cart, billingDetails: BillingDetails) {
  if (cart.items.length === 0) {
    throw new Error('Cart is empty')
  }

  const resolvedItems = await Promise.all(cart.items.map(resolveCartItem))

  const lineSubtotal = resolvedItems.reduce((sum, item) => {
    const addonTotal = item.addons.reduce((addonSum, addon) => addonSum + addon.priceAtOrder, 0)
    return sum + (item.unitPrice + addonTotal) * item.quantity
  }, 0)

  const shippingFee = billingDetails.shippingFee ?? 0
  const subtotal = lineSubtotal
  const total = subtotal + shippingFee
  const orderNumber = generateOrderNumber()

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,
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
        subtotal: decimal(subtotal),
        shippingFee: decimal(shippingFee),
        total: decimal(total),
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            sizeLabel: item.sizeLabel,
            unitPrice: decimal(item.unitPrice),
            quantity: item.quantity,
            addons: {
              create: item.addons.map((addon) => ({
                addonName: addon.addonName,
                selectedLabel: addon.selectedLabel,
                textValue: addon.textValue,
                priceAtOrder: decimal(addon.priceAtOrder),
              })),
            },
          })),
        },
      },
      include: {
        items: {
          include: { addons: true },
        },
      },
    })

    return order
  })
}
