const { PrismaClient, PropertyType, PropertyStatus } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        const seller = await prisma.user.findUnique({ where: { email: 'seller@example.com' } });
        if (!seller) {
            console.error('Seeded seller not found. Run prisma db seed first.');
            process.exit(1);
        }

        const property = await prisma.property.create({
            data: {
                title: 'Automated Test Property',
                address: `42 Test Lane ${Date.now()}`,
                city: 'Testville',
                state: 'TS',
                zipCode: '00042',
                propertyType: PropertyType.HOUSE,
                price: 123456,
                bedrooms: 2,
                bathrooms: 1,
                squareFeet: 900,
                description: 'Created by automation for smoke test',
                amenities: JSON.stringify(['test-amenity']),
                status: PropertyStatus.ACTIVE,
                ownerId: seller.id,
            },
        });

        const photos = await prisma.propertyPhoto.createMany({
            data: [
                { propertyId: property.id, url: 'https://placehold.co/800x600?text=photo1', blobKey: 'test-photo-1', displayOrder: 0 },
                { propertyId: property.id, url: 'https://placehold.co/800x600?text=photo2', blobKey: 'test-photo-2', displayOrder: 1 },
            ],
        });

        console.log('Created property id:', property.id);
        console.log('Created photos count:', photos.count);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        // ensure we disconnect to let node exit
        try { await require('@prisma/client').PrismaClient.prototype.$disconnect.call(require('@prisma/client').PrismaClient.prototype); } catch (e) { }
        process.exit(0);
    }
}

main();
