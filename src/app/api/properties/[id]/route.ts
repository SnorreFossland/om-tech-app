import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'
import { auth } from '@/auth/auth'

export async function GET(req: Request, context: any) {
  try {
    const url = new URL(req.url)
    // id may be provided via context.params which can be a value or a Promise in Next's types
    let id: string | undefined
    if (context?.params) {
      const p = context.params
      const resolved = typeof p.then === 'function' ? await p : p
      // resolved might be { id: '...' }
      if (typeof resolved === 'object') id = resolved.id
      else if (typeof resolved === 'string') id = resolved
    }
    if (!id) id = url.searchParams.get('id') || undefined
    if (!id) return new NextResponse(JSON.stringify({ error: 'Missing id' }), { status: 400 })

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { displayOrder: 'asc' } },
        owner: { select: { id: true, name: true, email: true } },
        representative: { select: { id: true, name: true, email: true } },
      },
    })

    if (!property) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 })

    return NextResponse.json({ data: property })
  } catch (err) {
    console.error('GET /api/properties/[id] error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function PUT(req: Request, context: any) {
  try {
    let id: string | undefined
    if (context?.params) {
      const p = context.params
      const resolved = typeof p.then === 'function' ? await p : p
      if (typeof resolved === 'object') id = resolved.id
      else if (typeof resolved === 'string') id = resolved
    }
    if (!id) return new NextResponse(JSON.stringify({ error: 'Missing id' }), { status: 400 })

    const body = await req.json()

  // enforce authentication and ownership (ownerId matches session user or representative)
  const session = await auth()
  if (!session?.user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } })
  if (!dbUser) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  const existing = await prisma.property.findUnique({ where: { id } })
  if (!existing) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 })
  const isOwner = existing.ownerId === dbUser.id
  const isRep = dbUser.role === 'REPRESENTATIVE'
  if (!isOwner && !isRep) return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

  const updateData: any = {}
    const allowed = ['title','address','city','state','zipCode','country','propertyType','price','bedrooms','bathrooms','squareFeet','description','amenities','status','representativeId','keepVisibleAfterArchive']
    for (const k of allowed) {
      if (body[k] !== undefined) updateData[k] = body[k]
    }
    if (updateData.amenities && typeof updateData.amenities !== 'string') updateData.amenities = JSON.stringify(updateData.amenities)

    const updated = await prisma.property.update({ where: { id }, data: updateData })
    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error('PUT /api/properties/[id] error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    let id: string | undefined
    if (context?.params) {
      const p = context.params
      const resolved = typeof p.then === 'function' ? await p : p
      if (typeof resolved === 'object') id = resolved.id
      else if (typeof resolved === 'string') id = resolved
    }
    if (!id) return new NextResponse(JSON.stringify({ error: 'Missing id' }), { status: 400 })

  // enforce authentication and ownership
  const session = await auth()
  if (!session?.user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } })
  if (!dbUser) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  const existing = await prisma.property.findUnique({ where: { id } })
  if (!existing) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 })
  const isOwner = existing.ownerId === dbUser.id
  const isRep = dbUser.role === 'REPRESENTATIVE'
  if (!isOwner && !isRep) return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

  await prisma.property.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('DELETE /api/properties/[id] error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
