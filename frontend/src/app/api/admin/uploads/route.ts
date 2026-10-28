import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { getImageUrl } from '@/lib/media'
import { ImageError, saveImage } from '@/lib/storage'

export const runtime = 'nodejs'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** Admin-only. Accepts multipart form data with an image in `file`; returns the stored path/URL. */
export async function POST(request: Request) {
  try {
    requireAuth(request, { subject: 'admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data with a "file" field' }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 10 MB)' }, { status: 413 })
  }

  try {
    const path = await saveImage(Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ path, url: getImageUrl(path) }, { status: 201 })
  } catch (err) {
    if (err instanceof ImageError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('Image upload failed', err)
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
  }
}
