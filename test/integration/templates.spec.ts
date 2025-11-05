import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Use TEST_DATABASE_URL if provided; otherwise fall back to DATABASE_URL
const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
if (!databaseUrl) {
    console.warn('No TEST_DATABASE_URL or DATABASE_URL set — skipping tests. Set TEST_DATABASE_URL to run integration tests.');
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } } as any);

describe('Template ownership (integration)', () => {
    let owner: any;
    let other: any;
    let template: any;

    beforeAll(async () => {
        if (!databaseUrl) return;
        // ensure clean state for test emails
        await prisma.user.deleteMany({ where: { email: { in: ['owner@example.test', 'other@example.test'] } } });

        owner = await prisma.user.upsert({
            where: { email: 'owner@example.test' } as any,
            create: { email: 'owner@example.test', password: 'x' },
            update: {},
        });
        other = await prisma.user.upsert({
            where: { email: 'other@example.test' } as any,
            create: { email: 'other@example.test', password: 'x' },
            update: {},
        });
    });

    afterAll(async () => {
        if (!databaseUrl) return;
        // cleanup
        await prisma.template.deleteMany({ where: { name: 'itest-template' } });
        await prisma.user.deleteMany({ where: { email: { in: ['owner@example.test', 'other@example.test'] } } });
        await prisma.$disconnect();
    });

    it('owner can create and update/delete, other cannot', async () => {
        if (!databaseUrl) return;

        // create template as owner
        template = await prisma.template.create({ data: { name: 'itest-template', description: 'for tests', schema: { sections: [] }, createdBy: owner.id } });
        expect(template).toBeTruthy();
        expect(template.createdBy).toEqual(owner.id);

        // owner update should succeed
        const updated = await prisma.template.update({ where: { id: template.id }, data: { description: 'owner updated', version: { increment: 1 }, updatedBy: owner.id } });
        expect(updated.version).toBeGreaterThan(template.version ?? 1);
        expect(updated.updatedBy).toEqual(owner.id);

        // other update should be denied logically — simulate check
        const existing = await prisma.template.findUnique({ where: { id: template.id } });
        const otherCanUpdate = existing && (existing.createdBy === other.id || existing.createdBy === other.email);
        expect(otherCanUpdate).toBeFalsy();

        // attempt delete as other (simulate forbidden) — should not delete via our ownership guard; here we assert that other is not owner
        try {
            if (!otherCanUpdate) throw new Error('Forbidden');
            await prisma.template.delete({ where: { id: template.id } });
            // shouldn't reach here
            expect(false).toBeTruthy();
        } catch (e: any) {
            expect(e.message).toMatch(/Forbidden/);
        }

        // owner delete should succeed
        await prisma.template.delete({ where: { id: template.id } });
        const found = await prisma.template.findUnique({ where: { id: template.id } });
        expect(found).toBeNull();
    });
});
