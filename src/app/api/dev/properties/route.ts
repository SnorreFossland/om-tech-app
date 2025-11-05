import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'

// Dev-only endpoint to list properties for the dev user (based on dev cookie or x-dev-user-id header).
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  try {
    // read dev id from cookie or header
    const cookie = req.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )dev-user-id=([^;]+)/)
    let devId: string | null = null
    if (m && m[1]) devId = decodeURIComponent(m[1])
    if (!devId) devId = req.headers.get('x-dev-user-id') || null

    if (!devId) {
      return new NextResponse(JSON.stringify({ error: 'dev-user-id not provided' }), { status: 400 })
    }

    const properties = await prisma.property.findMany({
      where: { ownerId: devId },
      include: { photos: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ data: properties })
  } catch (err) {
    console.error('GET /api/dev/properties error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
