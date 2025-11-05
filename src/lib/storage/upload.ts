import crypto from 'crypto'

/**
 * Vercel Blob upload adapter (minimal, configurable)
 *
 * Environment variables used:
 * - VERCEL_BLOB_API_BASE: base URL to PUT blobs to (e.g. https://api.vercel.com/v1/blob or storage endpoint)
 * - VERCEL_BLOB_READ_WRITE_TOKEN: bearer token for authorization
 * - VERCEL_BLOB_CDN_BASE: optional CDN base URL to construct public URLs (e.g. https://edge.vercel-storage.com/<account>)
 *
 * This file provides small helpers used by server-side routes to upload property images.
 * The implementation uses a simple HTTP PUT to `${VERCEL_BLOB_API_BASE}/${blobKey}` with
 * Authorization: Bearer ${VERCEL_BLOB_READ_WRITE_TOKEN}.
 *
 * NOTE: Vercel's SDK or API details may change; if you use the official @vercel/blob SDK, swap implementation accordingly.
 */

const API_BASE = process.env.VERCEL_BLOB_API_BASE || ''
const TOKEN = process.env.VERCEL_BLOB_READ_WRITE_TOKEN || ''
const CDN_BASE = process.env.VERCEL_BLOB_CDN_BASE || ''

function makeBlobKey(filename: string) {
  const id = crypto.randomBytes(6).toString('hex')
  const safe = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  return `${Date.now()}-${id}-${safe}`
}

export type UploadResult = {
  blobKey: string
  url: string
}

/**
 * Upload a buffer to the configured blob API. Returns blobKey and public URL.
 */
export async function uploadPropertyImageFromBuffer(buffer: Buffer, filename: string, contentType = 'application/octet-stream'): Promise<UploadResult> {
  if (!API_BASE || !TOKEN) {
    // Fallback: return placeholder URL and a fake blobKey for dev
    const blobKey = `dev/${makeBlobKey(filename)}`
    return { blobKey, url: CDN_BASE || `https://placehold.co/800x600?text=${encodeURIComponent(filename)}` }
  }

  const blobKey = makeBlobKey(filename)
  const uploadUrl = `${API_BASE.replace(/\/$/, '')}/${blobKey}`

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': contentType,
      'Content-Length': String(buffer.length),
    },
    // `Buffer` may not match the DOM BodyInit type in TS so cast here for Node fetch
    body: buffer as any,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to upload blob: ${res.status} ${res.statusText} ${text}`)
  }

  const url = CDN_BASE ? `${CDN_BASE.replace(/\/$/, '')}/${blobKey}` : uploadUrl
  return { blobKey, url }
}

/**
 * Convenience for when you already have a ReadableStream or file object in browser; convert to buffer on server if needed.
 */
export async function uploadPropertyImageFromStream(stream: NodeJS.ReadableStream, filename: string, contentType = 'application/octet-stream') {
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  const buffer = Buffer.concat(chunks)
  return uploadPropertyImageFromBuffer(buffer, filename, contentType)
}

/**
 * Construct public URL for a stored blobKey.
 */
export function getPublicUrl(blobKey: string) {
  if (CDN_BASE) return `${CDN_BASE.replace(/\/$/, '')}/${blobKey}`
  if (API_BASE) return `${API_BASE.replace(/\/$/, '')}/${blobKey}`
  return blobKey
}

/**
 * Delete blob by key if API supports DELETE. Returns true if deleted or not configured.
 */
export async function deleteBlob(blobKey: string): Promise<boolean> {
  if (!API_BASE || !TOKEN) return true
  const url = `${API_BASE.replace(/\/$/, '')}/${blobKey}`
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` } })
  return res.ok
}
