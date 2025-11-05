import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";
import { auth } from "@/auth/auth";
import { z } from "zod";

const updateTemplateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    schema: z.any().optional(),
});

async function resolveParams(params: any) {
    if (!params) return undefined;
    // In Next dev types the params can be a Promise — support both sync and async
    if (typeof params.then === "function") {
        try {
            return await params;
        } catch {
            return undefined;
        }
    }
    return params;
}

export async function GET(request: Request, context: { params: any }) {
    try {
        const resolved = await resolveParams(context.params);
        const id = resolved?.id;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        const t = await prisma.template.findUnique({ where: { id } });
        if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(t);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: any }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolved = await resolveParams(context.params);
        const id = resolved?.id;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const body = await request.json();
        let { name, description, schema } = body ?? {};

        // Require at least one editable field
        if (name === undefined && description === undefined && schema === undefined) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // If schema is a string, try to parse it as JSON
        if (typeof schema === "string") {
            try {
                schema = JSON.parse(schema);
            } catch (e) {
                return NextResponse.json({ error: "Invalid JSON for schema" }, { status: 400 });
            }
        }

        // Validate incoming payload
        const parsed = updateTemplateSchema.safeParse({ name, description, schema });
        if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
        const validated = parsed.data;

        // Ownership check: only the creator may update
        const existing = await prisma.template.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const actorId = (session.user as any)?.id ?? null;
        const actorEmail = (session.user as any)?.email ?? null;
        if (existing.createdBy && existing.createdBy !== actorId && existing.createdBy !== actorEmail) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // keep a copy of the previous snapshot for history/revert
        const prevSnapshot = { id: existing.id, name: existing.name, version: existing.version, schema: existing.schema };

        const updated = await prisma.template.update({
            where: { id },
            data: {
                ...(validated.name !== undefined ? { name: validated.name } : {}),
                ...(validated.description !== undefined ? { description: validated.description } : {}),
                ...(validated.schema !== undefined ? { schema: validated.schema } : {}),
                version: { increment: 1 },
                updatedBy: actorId ?? actorEmail ?? null,
            },
        });

        // Audit entry with prev snapshot
        try {
            await prisma.audit.create({ data: { entity: 'Template', entityId: updated.id, action: 'update', actor: actorId ?? actorEmail ?? null, meta: { changed: Object.keys(parsed.success ? parsed.data : {}), prevSnapshot } } });
        } catch (e) {
            console.warn('Failed to write audit record for template update', e);
        }

        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Unable to update" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: any }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolved = await resolveParams(context.params);
        const id = resolved?.id;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        // Ownership check: only the creator may delete
        const existing = await prisma.template.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const actorId = (session.user as any)?.id ?? null;
        const actorEmail = (session.user as any)?.email ?? null;
        if (existing.createdBy && existing.createdBy !== actorId && existing.createdBy !== actorEmail) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const deleted = await prisma.template.delete({ where: { id } });

        try {
            await prisma.audit.create({ data: { entity: 'Template', entityId: deleted.id, action: 'delete', actor: actorId ?? actorEmail ?? null, meta: { name: deleted.name } } });
        } catch (e) {
            console.warn('Failed to write audit record for template delete', e);
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Unable to delete" }, { status: 500 });
    }
}
