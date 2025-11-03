// scripts/createUser.js
// Usage: node scripts/createUser.js <email> <password> "Display Name"
// Example: node scripts/createUser.js owner@example.com s3cr3t "Owner Name"

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2] || 'owner@example.com';
    const plain = process.argv[3] || 'password';
    const name = process.argv[4] || 'Owner';

    if (!email || !plain) {
        console.error('Usage: node scripts/createUser.js <email> <password> "Display Name"');
        process.exit(1);
    }

    const hash = bcrypt.hashSync(plain, 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        const updated = await prisma.user.update({ where: { email }, data: { password: hash, name } });
        console.log('Updated existing user:', { id: updated.id, email: updated.email, name: updated.name });
        return;
    }

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hash,
        },
    });

    console.log('Created user:', { id: user.id, email: user.email, name: user.name });
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
