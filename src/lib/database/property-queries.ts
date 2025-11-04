import { prisma } from '@/auth/prisma'

export async function searchProperties(opts: {
  city?: string
  propertyType?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minSqft?: number
  page?: number
  pageSize?: number
}) {
  const {
    city,
    propertyType,
    status,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minSqft,
    page = 1,
    pageSize = 20,
  } = opts

  const where: any = {}
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

  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      include: { photos: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  return { total, page, pageSize, items }
}

export async function getPropertyById(id?: string) {
  if (!id) return null
  return prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { displayOrder: 'asc' } },
      owner: { select: { id: true, name: true, email: true } },
      representative: { select: { id: true, name: true, email: true } },
    },
  })
}
