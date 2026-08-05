/**
 * Estimated delivery is a simple business-day model, not a live carrier
 * quote (no logistics integration exists yet): the warehouse takes up to
 * DISPATCH_LEAD_DAYS business days to dispatch an order, and delivery lands
 * DELIVERY_LEAD_DAYS business day(s) after dispatch completes. Weekends are
 * skipped throughout.
 */

const DISPATCH_LEAD_DAYS = 6
const DELIVERY_LEAD_DAYS = 1

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let remaining = days
  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) remaining -= 1
  }
  return result
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(date)
}

export interface DeliveryEstimate {
  orderPlaced: Date
  dispatchStart: Date
  dispatchEnd: Date
  estimatedArrival: Date
  orderPlacedLabel: string
  dispatchRangeLabel: string
  estimatedArrivalLabel: string
}

export function getDeliveryEstimate(referenceDate: Date = new Date()): DeliveryEstimate {
  const orderPlaced = referenceDate
  const dispatchStart = orderPlaced
  const dispatchEnd = addBusinessDays(orderPlaced, DISPATCH_LEAD_DAYS)
  const estimatedArrival = addBusinessDays(dispatchEnd, DELIVERY_LEAD_DAYS)

  return {
    orderPlaced,
    dispatchStart,
    dispatchEnd,
    estimatedArrival,
    orderPlacedLabel: formatShortDate(orderPlaced),
    dispatchRangeLabel: `${formatShortDate(dispatchStart)} - ${formatShortDate(dispatchEnd)}`,
    estimatedArrivalLabel: formatShortDate(estimatedArrival),
  }
}
