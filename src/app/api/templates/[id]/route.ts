import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";

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

        const updated = await prisma.template.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(schema !== undefined ? { schema } : {}),
                version: { increment: 1 },
            },
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Unable to update" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: any }) {
    try {
        const resolved = await resolveParams(context.params);
        const id = resolved?.id;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        await prisma.template.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Unable to delete" }, { status: 500 });
    }
}
