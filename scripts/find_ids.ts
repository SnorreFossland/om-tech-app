#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const prop = await prisma.property.findFirst({ select: { id: true, title: true, ownerId: true } })
  const rep = await prisma.user.findFirst({ where: { role: 'REPRESENTATIVE' }, select: { id: true, email: true } })
  const seller = await prisma.user.findFirst({ where: { role: 'SELLER' }, select: { id: true, email: true } })
  console.log('sampleProperty:', prop)
  console.log('sampleRepresentative:', rep)
  console.log('sampleSeller:', seller)
}

main().catch((e)=>{ console.error(e); process.exit(1) })
