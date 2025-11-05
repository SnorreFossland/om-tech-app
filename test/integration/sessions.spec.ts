import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Prepare a mockable session value
let fakeSession: any = null;

vi.mock('@/auth/auth', () => ({
    auth: () => Promise.resolve(fakeSession),
}));

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } } as any);

describe('Sessions API (integration)', () => {
    let user: any;
    let template: any;

    beforeAll(async () => {
        if (!databaseUrl) return;
        // ensure clean
        await prisma.user.deleteMany({ where: { email: { in: ['session-owner@example.test'] } } }).catch(() => { });

        user = await prisma.user.upsert({
            where: { email: 'session-owner@example.test' } as any,
            create: { email: 'session-owner@example.test', password: 'x' },
            update: {},
        });

        await prisma.template.deleteMany({ where: { name: 'sess-template' } }).catch(() => { });
        // `name` is not a unique field on Template, so upsert by name is invalid.
        // Use findFirst/create to make this idempotent without requiring a unique constraint.
        template = await prisma.template.findFirst({ where: { name: 'sess-template' } }) as any;
        if (!template) {
            template = await prisma.template.create({
                data: { name: 'sess-template', description: 'for session tests', schema: { sections: [] }, createdBy: user.id },
            });
        } else {
            // ensure updatedBy and description are set for consistency
            template = await prisma.template.update({ where: { id: template.id }, data: { description: 'for session tests', schema: { sections: [] }, updatedBy: user.id } });
        }
    });

    afterAll(async () => {
        if (!databaseUrl) return;
        await prisma.session.deleteMany({ where: { title: { contains: 'Session:' } } });
        await prisma.template.deleteMany({ where: { name: 'sess-template' } });
        await prisma.user.deleteMany({ where: { email: { in: ['session-owner@example.test'] } } });
        await prisma.$disconnect();
    });

    it('creates a session with a template snapshot when authenticated', async () => {
        if (!databaseUrl) return;

        // set the fake session to simulate authentication
        fakeSession = { user: { id: user.id, email: user.email } };

        // import the POST handler dynamically so the mock above is effective
        const mod = await import('@/app/api/sessions/route');

        const req = new Request('http://localhost/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Session: from test', templateId: template.id }),
        });

        const res = await mod.POST(req as any);
        const json = await res.json();

        expect((res as any).status).toBe(201);
        expect(json).toBeTruthy();
        expect(json.templateSnapshot).toBeTruthy();
        expect(json.templateSnapshot.id).toEqual(template.id);
        expect(json.createdBy).toEqual(user.id);
    });
});
