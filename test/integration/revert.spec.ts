import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { prisma } from '@/auth/prisma';

// Use TEST_DATABASE_URL if provided; otherwise fall back to DATABASE_URL
const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
if (!databaseUrl) {
    console.warn('No TEST_DATABASE_URL or DATABASE_URL set — skipping tests. Set TEST_DATABASE_URL to run integration tests.');
}

describe('Template revert HTTP handler (integration)', () => {
    let owner: any;
    let template: any;
    let audit: any;

    beforeAll(async () => {
        if (!databaseUrl) return;
        // cleanup any previous test artifacts
        await prisma.audit.deleteMany({ where: { entity: 'Template', actor: { contains: 'itest-' } } }).catch(() => { });
        await prisma.template.deleteMany({ where: { name: 'itest-revert' } }).catch(() => { });
        await prisma.user.deleteMany({ where: { email: { in: ['itest-owner@example.test'] } } }).catch(() => { });

        owner = await prisma.user.upsert({
            where: { email: 'itest-owner@example.test' } as any,
            create: { email: 'itest-owner@example.test', password: 'x' },
            update: {},
        });

        // create initial template (v1)
        template = await prisma.template.create({ data: { name: 'itest-revert', description: 'initial', schema: { sections: [{ id: 's1', title: 'A' }] }, createdBy: owner.id } });

        // update to v2
        await prisma.template.update({ where: { id: template.id }, data: { schema: { sections: [{ id: 's1', title: 'B' }] }, version: { increment: 1 }, updatedBy: owner.id } });

        // create an audit record representing the initial snapshot we want to revert to
        const snapshot = { id: template.id, name: template.name, version: template.version, schema: { sections: [{ id: 's1', title: 'A' }] } };
        audit = await prisma.audit.create({ data: { entity: 'Template', entityId: template.id, action: 'update', actor: `itest-${owner.id}`, meta: { snapshot } } });
    });

    afterAll(async () => {
        if (!databaseUrl) return;
        await prisma.template.deleteMany({ where: { name: 'itest-revert' } }).catch(() => { });
        await prisma.audit.deleteMany({ where: { entity: 'Template', entityId: template?.id } }).catch(() => { });
        await prisma.user.deleteMany({ where: { email: 'itest-owner@example.test' } }).catch(() => { });
        await prisma.$disconnect();
    });

    it('reverts template when authorized and audit exists', async () => {
        if (!databaseUrl) return;

        // Mock auth() to return the owner session
        vi.doMock('@/auth/auth', () => ({ auth: async () => ({ user: { id: owner.id, email: owner.email } }) }));

        // Import the route handler after mocking
        const mod = await import('@/app/api/templates/[id]/revert/route');
        const { POST } = mod as any;

        // Call the POST handler to revert to the audit snapshot
        const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ auditId: audit.id }), headers: { 'Content-Type': 'application/json' } });
        const res: any = await POST(req, { params: { id: template.id } });

        // Expect a successful response
        expect(res).toBeTruthy();
        // NextResponse in Next returns an object with json() — try to parse
        const body = await res.json();
        expect(body).toBeTruthy();
        // The reverted template should have the schema from the snapshot
        expect(body.schema?.sections?.[0]?.title).toEqual('A');

        // There should also be an audit entry for the revert
        const revertAudit = await prisma.audit.findFirst({ where: { entity: 'Template', entityId: template.id, action: 'revert' }, orderBy: { createdAt: 'desc' } });
        expect(revertAudit).toBeTruthy();
        expect(revertAudit?.meta?.snapshot).toBeTruthy();
    });
});
