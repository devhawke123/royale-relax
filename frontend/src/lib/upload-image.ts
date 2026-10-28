const MAX_DIMENSION = 2000
const SEND_AS_IS_BYTES = 1.5 * 1024 * 1024

export interface UploadedImage {
  path: string
  url: string
}

/**
 * Phone photos can be 5-10 MB, and hosts like Vercel reject request bodies over
 * ~4.5 MB. Downscale large files in the browser first; the server re-encodes
 * to WebP again regardless. Falls back to the original file if anything fails.
 */
async function shrink(file: File): Promise<Blob> {
  if (file.size <= SEND_AS_IS_BYTES || !file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

/** Uploads one image to /api/admin/uploads and returns the path to save in the product. */
export async function uploadImage(file: File, accessToken: string): Promise<UploadedImage> {
  const body = new FormData()
  body.append('file', await shrink(file), file.name)

  const res = await fetch('/api/admin/uploads', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  })
  if (res.status === 413) throw new Error('Image is too large. Try a smaller photo.')
  const data = (await res.json().catch(() => null)) as (Partial<UploadedImage> & { error?: string }) | null
  if (!res.ok || !data?.path) throw new Error(data?.error ?? 'Image upload failed')
  return { path: data.path, url: data.url ?? data.path }
}
