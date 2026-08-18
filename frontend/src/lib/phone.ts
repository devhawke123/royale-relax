/** "+44 7999 371906" -> "tel:+447999371906". Client-safe (no server-only imports). */
export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
