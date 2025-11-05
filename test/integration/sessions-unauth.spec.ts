import { describe, it, expect, vi } from 'vitest';

vi.mock('@/auth/auth', () => ({
    auth: () => Promise.resolve(null),
}));

describe('Sessions API unauthenticated', () => {
    it('returns 401 when not authenticated', async () => {
        const mod = await import('@/app/api/sessions/route');
        const req = new Request('http://localhost/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'should fail' }) });
        const res: any = await mod.POST(req as any);
        expect([401, 403]).toContain(res.status);
    });
});
