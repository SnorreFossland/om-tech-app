import { NextResponse } from 'next/server'
import { auth } from '@/auth/auth'
import { prisma } from '@/auth/prisma'
import { uploadPropertyImageFromBuffer } from '@/lib/storage/upload'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const propertyId = String(form.get('propertyId') || '')
  if (!propertyId) return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })

  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  // Authorization: allow owner or assigned representative to upload
  const user = session.user as unknown as { id: string }
  const userId = user.id
  if (property.ownerId !== userId) {
    // check representative assignment
    const assign = await prisma.representativeAssignment.findUnique({ where: { propertyId: propertyId } })
    if (!assign || assign.representativeId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const files = form.getAll('files') as File[]
  if (!files || files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

  const created: Array<{ id: string; url: string; blobKey?: string }> = []

  for (const f of files) {
    try {
  const buffer = Buffer.from(await f.arrayBuffer())
  const fileMeta = f as unknown as { name?: string; type?: string }
  const name = fileMeta.name || 'upload.jpg'
  const contentType = fileMeta.type || 'image/jpeg'
  const res = await uploadPropertyImageFromBuffer(buffer, name, contentType)
      const photo = await prisma.propertyPhoto.create({ data: { propertyId: propertyId, url: res.url, blobKey: res.blobKey } })
      created.push({ id: photo.id, url: photo.url, blobKey: photo.blobKey })
    } catch (err) {
      console.error('upload error', err)
      // continue on error for other files
    }
  }

  return NextResponse.json({ data: created })
}
