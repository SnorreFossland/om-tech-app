import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";
import { auth } from "@/auth/auth";
import { z } from "zod";

const revertBodySchema = z.object({
    auditId: z.string().optional(),
    snapshot: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        version: z.number().optional(),
        schema: z.any(),
    }).optional(),
});

async function resolveParams(params: any) {
    if (!params) return undefined;
    if (typeof params.then === "function") {
        try {
            return await params;
        } catch {
            return undefined;
        }
    }
    return params;
}

export async function POST(request: Request, context: { params: any }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolved = await resolveParams(context.params);
        const id = resolved?.id;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const body = await request.json().catch(() => ({}));
        const parsed = revertBodySchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });

        const { auditId, snapshot: providedSnapshot } = parsed.data;

        // Fetch existing template
        const existing = await prisma.template.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const actorId = (session.user as any)?.id ?? null;
        const actorEmail = (session.user as any)?.email ?? null;
        if (existing.createdBy && existing.createdBy !== actorId && existing.createdBy !== actorEmail) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let snapshot: any = providedSnapshot ?? null;

        // If auditId provided, try to load snapshot from audit record
        if (!snapshot && auditId) {
            const audit = await prisma.audit.findUnique({ where: { id: auditId } });
            if (!audit) return NextResponse.json({ error: "Audit record not found" }, { status: 404 });
            // audit.meta may contain snapshot or prevSnapshot
            const meta: any = audit.meta ?? {};
            snapshot = meta.snapshot ?? meta.prevSnapshot ?? null;
        }

        if (!snapshot) return NextResponse.json({ error: "No snapshot provided or found from audit" }, { status: 400 });

        // Basic validation of snapshot shape
        if (!snapshot.schema) return NextResponse.json({ error: "Snapshot missing schema" }, { status: 400 });

        // Keep a copy of prev snapshot for audit
        const prevSnapshot = { id: existing.id, name: existing.name, version: existing.version, schema: existing.schema };

        // Apply the snapshot and create an audit record in a single transaction
        const [updated, audit] = await prisma.$transaction([
            prisma.template.update({
                where: { id },
                data: {
                    ...(snapshot.name !== undefined ? { name: snapshot.name } : {}),
                    ...(snapshot.description !== undefined ? { description: snapshot.description } : {}),
                    ...(snapshot.schema !== undefined ? { schema: snapshot.schema } : {}),
                    version: { increment: 1 },
                    updatedBy: actorId ?? actorEmail ?? null,
                },
            }),
            prisma.audit.create({ data: { entity: 'Template', entityId: id, action: 'revert', actor: actorId ?? actorEmail ?? null, meta: { fromAuditId: auditId ?? null, snapshot, prevSnapshot } } }),
        ]).catch((e) => {
            console.error('Transaction failed for revert:', e);
            throw e;
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Unable to revert" }, { status: 500 });
    }
}
