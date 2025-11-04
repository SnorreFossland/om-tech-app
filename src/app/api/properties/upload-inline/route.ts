import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'
import type { PropertyPhoto } from '@prisma/client'
import { uploadPropertyImageFromBuffer } from '@/lib/storage/upload'
import { auth } from '@/auth/auth'

type ImageInput = {
  filename: string
  contentType: string
  base64: string
  displayOrder?: number
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { propertyId, images } = body as { propertyId?: string; images?: ImageInput[] }

    if (!propertyId || !Array.isArray(images) || images.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Missing propertyId or images' }), { status: 400 })
    }

    // enforce authentication and ownership: only the owner or a representative may upload photos
    const session = await auth()
    if (!session?.user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } })
    if (!dbUser) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const existing = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!existing) return new NextResponse(JSON.stringify({ error: 'Property not found' }), { status: 404 })

    const isOwner = existing.ownerId === dbUser.id
    const isRep = dbUser.role === 'REPRESENTATIVE'
    if (!isOwner && !isRep) return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

  const createdPhotos: PropertyPhoto[] = []

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      if (!img.base64 || !img.filename) continue
      const buffer = Buffer.from(img.base64, 'base64')
      // upload to blob storage
      const { blobKey, url } = await uploadPropertyImageFromBuffer(buffer, img.filename, img.contentType || 'image/jpeg')

      // create PropertyPhoto record
      const photo = await prisma.propertyPhoto.create({
        data: {
          propertyId,
          url,
          blobKey,
          displayOrder: typeof img.displayOrder === 'number' ? img.displayOrder : i,
        },
      })
      createdPhotos.push(photo)
    }

    return NextResponse.json({ data: createdPhotos })
  } catch (err: unknown) {
    console.error('POST /api/properties/upload-inline error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
