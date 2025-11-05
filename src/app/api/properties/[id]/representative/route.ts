import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'
import { auth } from '@/auth/auth'

// POST: assign a representative to a property
export async function POST(req: Request, context: any) {
  try {
    // resolve id from context.params or URL
    let id: string | undefined
    if (context?.params) {
      const p = context.params
      const resolved = typeof p.then === 'function' ? await p : p
      if (typeof resolved === 'object') id = resolved.id
      else if (typeof resolved === 'string') id = resolved
    }
    if (!id) return new NextResponse(JSON.stringify({ error: 'Missing property id' }), { status: 400 })

    // Development helper: allow a dev-only cookie to identify the user so smoke
    // test scripts can authenticate without NextAuth. This is only honored in
    // development.
    let dbUser = null
    try {
      if (process.env.NODE_ENV === 'development') {
        const cookie = req.headers.get('cookie') || ''
        const m = cookie.match(/(?:^|; )dev-user-id=([^;]+)/)
        if (m && m[1]) {
          const devId = decodeURIComponent(m[1])
          dbUser = await prisma.user.findUnique({ where: { id: devId } })
        }
        // allow explicit header for test runners
        if (!dbUser) {
          const xId = req.headers.get('x-dev-user-id')
          if (xId) dbUser = await prisma.user.findUnique({ where: { id: xId as string } })
        }
      }
    } catch (e) {
      console.warn('dev cookie parse error', e)
    }

    if (!dbUser) {
      const session = await auth()
      if (!session?.user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } })
      if (!dbUser) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) return new NextResponse(JSON.stringify({ error: 'Property not found' }), { status: 404 })

    // Only the owner may assign a representative
    if (property.ownerId !== dbUser.id) return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

    const body = await req.json()
    const representativeId = body?.representativeId as string | undefined
    if (!representativeId) return new NextResponse(JSON.stringify({ error: 'Missing representativeId' }), { status: 400 })

    const rep = await prisma.user.findUnique({ where: { id: representativeId } })
    if (!rep) return new NextResponse(JSON.stringify({ error: 'Representative user not found' }), { status: 404 })
    if (rep.role !== 'REPRESENTATIVE') return new NextResponse(JSON.stringify({ error: 'User is not a representative' }), { status: 400 })

    // Upsert assignment (propertyId is unique in RepresentativeAssignment)
    const assignment = await prisma.representativeAssignment.upsert({
      where: { propertyId: id },
      update: {
        representativeId,
        assignedAt: new Date(),
      },
      create: {
        propertyId: id,
        representativeId,
      },
    })

    // Also set the property.representativeId for convenience
    await prisma.property.update({ where: { id }, data: { representativeId } })

    return NextResponse.json({ data: assignment })
  } catch (err) {
    console.error('POST /api/properties/[id]/representative error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

// DELETE: unassign representative from property
export async function DELETE(req: Request, context: any) {
  try {
    let id: string | undefined
    if (context?.params) {
      const p = context.params
      const resolved = typeof p.then === 'function' ? await p : p
      if (typeof resolved === 'object') id = resolved.id
      else if (typeof resolved === 'string') id = resolved
    }
    if (!id) return new NextResponse(JSON.stringify({ error: 'Missing property id' }), { status: 400 })

    // Development helper: accept dev-user-id cookie to identify the acting user
    let dbUser = null
    try {
      if (process.env.NODE_ENV === 'development') {
        const cookie = req.headers.get('cookie') || ''
        const m = cookie.match(/(?:^|; )dev-user-id=([^;]+)/)
        if (m && m[1]) {
          const devId = decodeURIComponent(m[1])
          dbUser = await prisma.user.findUnique({ where: { id: devId } })
        }
        // allow explicit header for test runners
        if (!dbUser) {
          const xId = req.headers.get('x-dev-user-id')
          if (xId) dbUser = await prisma.user.findUnique({ where: { id: xId as string } })
        }
      }
    } catch (e) {
      console.warn('dev cookie parse error', e)
    }

    if (!dbUser) {
      const session = await auth()
      if (!session?.user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } })
      if (!dbUser) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) return new NextResponse(JSON.stringify({ error: 'Property not found' }), { status: 404 })

    // Only owner may unassign
    if (property.ownerId !== dbUser.id) return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

    // Find existing assignment
    const existing = await prisma.representativeAssignment.findUnique({ where: { propertyId: id } })
    if (!existing) return new NextResponse(null, { status: 204 })

    await prisma.representativeAssignment.delete({ where: { id: existing.id } })
    await prisma.property.update({ where: { id }, data: { representativeId: null } })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('DELETE /api/properties/[id]/representative error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
