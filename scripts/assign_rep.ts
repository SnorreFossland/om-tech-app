#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error('Usage: npx ts-node scripts/assign_rep.ts <PROPERTY_ID> <REP_ID>')
    process.exit(1)
  }
  const [propertyId, representativeId] = args

  // validate existence
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) {
    console.error('Property not found:', propertyId)
    process.exit(1)
  }
  const rep = await prisma.user.findUnique({ where: { id: representativeId } })
  if (!rep) {
    console.error('Representative user not found:', representativeId)
    process.exit(1)
  }
  if (rep.role !== 'REPRESENTATIVE') {
    console.error('User is not a representative. Role:', rep.role)
    process.exit(1)
  }

  const assignment = await prisma.representativeAssignment.upsert({
    where: { propertyId },
    update: { representativeId, assignedAt: new Date() },
    create: { propertyId, representativeId },
  })

  await prisma.property.update({ where: { id: propertyId }, data: { representativeId } })

  console.log('Created/updated assignment:', assignment)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
