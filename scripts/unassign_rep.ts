#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error('Usage: npx ts-node scripts/unassign_rep.ts <PROPERTY_ID>')
    process.exit(1)
  }
  const [propertyId] = args

  const existing = await prisma.representativeAssignment.findUnique({ where: { propertyId } })
  if (!existing) {
    console.log('No existing assignment for property:', propertyId)
    process.exit(0)
  }

  await prisma.representativeAssignment.delete({ where: { id: existing.id } })
  await prisma.property.update({ where: { id: propertyId }, data: { representativeId: null } })

  console.log('Deleted assignment for property:', propertyId)
}

main().catch((e)=>{ console.error(e); process.exit(1) })
