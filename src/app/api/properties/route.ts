import { NextResponse } from 'next/server'
import { prisma } from '@/auth/prisma'
import { auth } from '@/auth/auth'
import { createPropertySchema } from '@/lib/validations/property'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams

    const city = q.get('city') || undefined
  const propertyType = q.get('propertyType') || undefined
  const ownerOnly = q.get('owner') === 'true'
    const status = q.get('status') || undefined
    const minPrice = q.get('minPrice') ? parseFloat(q.get('minPrice') as string) : undefined
    const maxPrice = q.get('maxPrice') ? parseFloat(q.get('maxPrice') as string) : undefined
    const bedrooms = q.get('bedrooms') ? parseInt(q.get('bedrooms') as string, 10) : undefined
    const bathrooms = q.get('bathrooms') ? parseFloat(q.get('bathrooms') as string) : undefined
    const minSqft = q.get('minSqft') ? parseInt(q.get('minSqft') as string, 10) : undefined
    const page = q.get('page') ? Math.max(1, parseInt(q.get('page') as string, 10)) : 1
    const pageSize = q.get('pageSize') ? Math.min(100, Math.max(1, parseInt(q.get('pageSize') as string, 10))) : 20

    const where: any = {}
    if (ownerOnly) {
      const session = await auth()
      if (!session?.user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } })
      if (!dbUser) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      where.ownerId = dbUser.id
    }
  if (city) where.city = { contains: city }
    if (propertyType) where.propertyType = propertyType
    if (status) where.status = status
    if (bedrooms !== undefined) where.bedrooms = bedrooms
    if (bathrooms !== undefined) where.bathrooms = bathrooms
  if (minSqft !== undefined) where.squareFeet = { gte: minSqft }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    const skip = (page - 1) * pageSize

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        include: {
          photos: { orderBy: { displayOrder: 'asc' } },
          owner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ])

    return NextResponse.json({ data: properties, meta: { total, page, pageSize } })
  } catch (err) {
    console.error('GET /api/properties error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createPropertySchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(JSON.stringify({ error: 'Validation failed', issues: parsed.error.format() }), { status: 400 })
    }
    // Development helper: accept dev-user-id cookie to identify acting user
    let dbUser = null
    try {
      if (process.env.NODE_ENV === 'development') {
        const cookie = req.headers.get('cookie') || ''
        console.log('dev cookie header (properties POST):', cookie)
        const m = cookie.match(/(?:^|; )dev-user-id=([^;]+)/)
        if (m && m[1]) {
          const devId = decodeURIComponent(m[1])
          dbUser = await prisma.user.findUnique({ where: { id: devId } })
        }
        // allow an explicit dev header for automated test runners
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

      // load user from DB to get role and id
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email as string } })
      if (!dbUser) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    if (dbUser.role !== 'SELLER') return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

    const {
      title,
      address,
      city,
      state,
      zipCode,
      country = 'USA',
      propertyType,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      description,
      amenities,
    } = parsed.data

    const property = await prisma.property.create({
      data: {
        title,
        address,
        city,
        state,
        zipCode,
        country,
        propertyType,
        price: Number(price),
        bedrooms: Number(bedrooms || 0),
        bathrooms: Number(bathrooms || 0),
        squareFeet: Number(squareFeet || 0),
        description: description || '',
        amenities: amenities ? JSON.stringify(amenities) : undefined,
        ownerId: dbUser.id,
      },
    })

    return NextResponse.json({ data: property })
  } catch (err) {
    console.error('POST /api/properties error', err)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
