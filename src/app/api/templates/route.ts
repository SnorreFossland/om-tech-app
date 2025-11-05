import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";
import { auth } from "@/auth/auth";
import { z } from "zod";

const createTemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    schema: z.any(),
});

export async function GET() {
    try {
        const templates = await prisma.template.findMany({ orderBy: { updatedAt: 'desc' } });
        return NextResponse.json(templates);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unable to list templates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Require an authenticated user
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await request.json();
        const parse = createTemplateSchema.safeParse(body);
        if (!parse.success) return NextResponse.json({ error: 'Invalid payload', details: parse.error.format() }, { status: 400 });
        const { name, description, schema } = parse.data;
        const createdBy = (session.user as any)?.id ?? (session.user as any)?.email ?? null;
        const t = await prisma.template.create({ data: { name, description, schema, createdBy } });

        // Audit entry with snapshot
        try {
            await prisma.audit.create({ data: { entity: 'Template', entityId: t.id, action: 'create', actor: createdBy ?? null, meta: { name, description, snapshot: { id: t.id, name: t.name, version: t.version, schema: t.schema } } } });
        } catch (e) {
            console.warn('Failed to write audit record for template create', e);
        }

        return NextResponse.json(t, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unable to create template' }, { status: 500 });
    }
}
