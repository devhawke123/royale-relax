import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import sharp from 'sharp'

/**
 * Image storage with two drivers, picked by environment:
 *   - S3 (Neon Object Storage in prod): used when AWS_ENDPOINT_URL_S3,
 *     AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are all set. The returned
 *     value is the object's full public URL.
 *   - Local disk (dev): everything else. Files go to public/uploads and the
 *     returned value is a site-relative path (/uploads/...).
 * Callers store the returned string in ProductImage.path / FabricColor.imagePath.
 */

const DEFAULT_BUCKET = 'royale-relax-products'
const KEY_PREFIX = 'products'
const LOCAL_ROOT = path.join(process.cwd(), 'public', 'uploads')

const MAX_DIMENSION = 2000
const WEBP_QUALITY = 82
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'avif'])

export class ImageError extends Error {}

function s3Config() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  if (!endpoint || !accessKeyId || !secretAccessKey) return null
  return {
    endpoint: endpoint.replace(/\/+$/, ''),
    accessKeyId,
    secretAccessKey,
    region: process.env.AWS_REGION ?? 'us-east-2',
    bucket: process.env.S3_BUCKET ?? DEFAULT_BUCKET,
  }
}

export function storageDriver(): 's3' | 'local' {
  return s3Config() ? 's3' : 'local'
}

let s3Client: S3Client | undefined

function getS3(config: NonNullable<ReturnType<typeof s3Config>>) {
  s3Client ??= new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
  return s3Client
}

/**
 * Validates the bytes really are a supported image, applies EXIF rotation,
 * caps the size and re-encodes as WebP. Throws ImageError on anything else.
 */
export async function processImage(input: Buffer): Promise<Buffer> {
  try {
    const meta = await sharp(input).metadata()
    if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
      throw new ImageError('Unsupported image type. Use JPG, PNG, WebP, GIF or AVIF.')
    }
    return await sharp(input)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
  } catch (err) {
    if (err instanceof ImageError) throw err
    throw new ImageError('That file could not be read as an image.')
  }
}

/**
 * Processes and stores an image, returning the string to save in the database.
 * Keys are content hashes, so the same picture always maps to the same file
 * (no duplicates, and re-running a migration is harmless).
 */
export async function saveImage(input: Buffer): Promise<string> {
  const webp = await processImage(input)
  const key = `${KEY_PREFIX}/${createHash('sha256').update(webp).digest('hex').slice(0, 24)}.webp`

  const config = s3Config()
  if (config) {
    await getS3(config).send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: webp,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
    return `${config.endpoint}/${config.bucket}/${key}`
  }

  if (process.env.NODE_ENV === 'production') {
    throw new ImageError('Image storage is not configured (AWS_ENDPOINT_URL_S3 / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY).')
  }
  const file = path.join(LOCAL_ROOT, key)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, webp)
  return `/uploads/${key}`
}
