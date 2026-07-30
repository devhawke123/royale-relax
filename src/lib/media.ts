const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? ''

export function getImageUrl(relativePath: string) {
  return `${MEDIA_BASE_URL}/images/${relativePath}`
}
