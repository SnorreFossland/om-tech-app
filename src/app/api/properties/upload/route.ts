import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'

/**
 * Simple upload endpoint (seller-facing).
 * Accepts JSON: { propertyId: string, photos: [{ url?: string, blobKey?: string, displayOrder?: number }] }
 * If `url` provided, creates PropertyPhoto records. Vercel Blob integration can be added later.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { propertyId, photos } = body
    if (!propertyId || !Array.isArray(photos)) {
      return new NextResponse(JSON.stringify({ error: 'Missing propertyId or photos array' }), { status: 400 })
    }

    const data = photos.map((p: any, i: number) => ({
      propertyId,
      url: p.url || '',
      blobKey: p.blobKey || '',
      displayOrder: typeof p.displayOrder === 'number' ? p.displayOrder : i,
    }))

    const created = await prisma.propertyPhoto.createMany({ data })
    return NextResponse.json({ data: created })
  } catch (err) {
    console.error('POST /api/properties/upload error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
