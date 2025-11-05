import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";
import { auth } from "@/auth/auth";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { title, templateId } = body;
        const actorId = (session.user as any)?.id ?? (session.user as any)?.email ?? null;

        let snapshot = null;
        if (templateId) {
            const t = await prisma.template.findUnique({ where: { id: templateId } });
            if (!t) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
            // store a snapshot of the template schema and metadata so sessions are stable
            snapshot = { id: t.id, name: t.name, version: t.version, schema: t.schema };
        }

        const s = await prisma.session.create({ data: { title, templateId: templateId ?? null, templateSnapshot: snapshot, createdBy: actorId } });
        return NextResponse.json(s, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const sessions = await prisma.session.findMany({ orderBy: { updatedAt: 'desc' } });
        return NextResponse.json(sessions);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unable to list sessions' }, { status: 500 });
    }
}
