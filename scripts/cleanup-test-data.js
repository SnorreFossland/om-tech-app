#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // By default delete properties that look like they were created by E2E tests
    const titleContains = process.env.TITLE_CONTAINS || 'E2E'

    console.log(`Looking for properties with title containing "${titleContains}"`)

    const props = await prisma.property.findMany({ where: { title: { contains: titleContains } }, select: { id: true } })
    const ids = props.map((p) => p.id)

    if (ids.length === 0) {
        console.log('No matching properties found. Nothing to delete.')
        return
    }

    console.log('Found properties:', ids)

    // Delete representative assignments for these properties
    const delAssign = await prisma.representativeAssignment.deleteMany({ where: { propertyId: { in: ids } } })
    console.log('Deleted representative assignments:', delAssign.count)

    // Delete photos
    const delPhotos = await prisma.propertyPhoto.deleteMany({ where: { propertyId: { in: ids } } })
    console.log('Deleted property photos:', delPhotos.count)

    // Delete properties
    const delProps = await prisma.property.deleteMany({ where: { id: { in: ids } } })
    console.log('Deleted properties:', delProps.count)
}

main()
    .catch((e) => {
        console.error(e)
        process.exitCode = 1
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
