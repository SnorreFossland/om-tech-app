import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

let fakeSession: any = null;

vi.mock('@/auth/auth', () => ({
    auth: () => Promise.resolve(fakeSession),
}));

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } } as any);

describe('Templates API (integration - handler level)', () => {
    let owner: any;
    let other: any;
    let template: any;

    beforeAll(async () => {
        if (!databaseUrl) return;
        await prisma.user.deleteMany({ where: { email: { in: ['owner@example.test', 'other@example.test'] } } }).catch(() => { });
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
        await prisma.template.deleteMany({ where: { name: 'apitest-template' } });
        await prisma.user.deleteMany({ where: { email: { in: ['owner@example.test', 'other@example.test'] } } });
        await prisma.$disconnect();
    });

    it('allows owner to create, update and delete template via handlers and prevents other user', async () => {
        if (!databaseUrl) return;

        // create as owner
        fakeSession = { user: { id: owner.id, email: owner.email } };
        const createMod = await import('@/app/api/templates/route');
        const createReq = new Request('http://localhost/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'apitest-template', description: 'api test', schema: { sections: [] } }) });
        const createRes: any = await createMod.POST(createReq as any);
        const created = await createRes.json();
        expect(createRes.status).toBe(201);
        expect(created).toBeTruthy();
        expect(created.createdBy).toEqual(owner.id);
        template = created;

        // owner update should succeed
        fakeSession = { user: { id: owner.id, email: owner.email } };
        const updateMod = await import('@/app/api/templates/[id]/route');
        const updateReq = new Request(`http://localhost/api/templates/${template.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'apitest-template', description: 'owner updated', schema: { sections: [] } }) });
        const updateRes: any = await updateMod.PUT(updateReq as any, { params: { id: template.id } } as any);
        const updated = await updateRes.json();
        expect(updateRes.status).toBe(200);
        expect(updated.updatedBy).toEqual(owner.id);

        // other user update should be forbidden
        fakeSession = { user: { id: other.id, email: other.email } };
        const otherUpdateReq = new Request(`http://localhost/api/templates/${template.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'apitest-template', description: 'other updated', schema: { sections: [] } }) });
        const otherUpdateRes: any = await updateMod.PUT(otherUpdateReq as any, { params: { id: template.id } } as any);
        expect(otherUpdateRes.status).toBe(403);

        // owner delete should succeed
        fakeSession = { user: { id: owner.id, email: owner.email } };
        const deleteMod = updateMod;
        const delReq = new Request(`http://localhost/api/templates/${template.id}`, { method: 'DELETE' });
        const delRes: any = await deleteMod.DELETE(delReq as any, { params: { id: template.id } } as any);
        expect([200, 204, 201].includes(delRes.status)).toBeTruthy();
    });
});
