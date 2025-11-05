import { PrismaClient, UserRole, PropertyType, PropertyStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // clear existing data (safe because this is dev seed)
  const maybeDelete = async (key: string) => {
    // @ts-ignore - dynamic access to possible model delegate
    const delegate = (prisma as any)[key]
    if (delegate && typeof delegate.deleteMany === 'function') {
      try {
        await delegate.deleteMany()
      } catch (e) {
        // ignore
      }
    }
  }

  await maybeDelete('aIEmailDraft')
  await maybeDelete('viewingRequest')
  await maybeDelete('inquiry')
  await maybeDelete('propertyPhoto')
  await maybeDelete('property')
  await maybeDelete('favorite')
  await maybeDelete('representativeAssignment')
  await maybeDelete('user')

  const passwordHash = await bcrypt.hash('Password123!', 10)

  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      name: 'Alice Seller',
      password: passwordHash,
      role: UserRole.SELLER,
    },
  })

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      name: 'Bob Buyer',
      password: passwordHash,
      role: UserRole.BUYER,
    },
  })

  const rep = await prisma.user.create({
    data: {
      email: 'rep@example.com',
      name: 'Rachel Rep',
      password: passwordHash,
      role: UserRole.REPRESENTATIVE,
    },
  })

  const property = await prisma.property.create({
    data: {
      title: 'Charming 3BR House',
      address: '123 Main St',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90210',
      propertyType: PropertyType.HOUSE,
      price: 725000,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1650,
      description: 'A lovely family home in a quiet neighborhood. Close to schools and parks.',
      amenities: JSON.stringify(['garage', 'garden', 'fireplace']),
      status: PropertyStatus.ACTIVE,
      ownerId: seller.id,
      representativeId: rep.id,
    },
  })

  await prisma.propertyPhoto.createMany({
    data: [
      { propertyId: property.id, url: 'https://placehold.co/800x600', blobKey: 'photo-1', displayOrder: 0 },
      { propertyId: property.id, url: 'https://placehold.co/800x600', blobKey: 'photo-2', displayOrder: 1 },
    ],
  })

  await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      inquirerName: buyer.name || 'Buyer',
      inquirerEmail: buyer.email,
      message: 'I am interested in this property. Please contact me with more details.',
      representativeId: rep.id,
      status: 'PENDING_AI_PROCESSING',
    },
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
