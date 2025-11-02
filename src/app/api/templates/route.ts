import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";

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
        const body = await request.json();
        const { name, description, schema, createdBy } = body;
        const t = await prisma.template.create({ data: { name, description, schema, createdBy } });
        return NextResponse.json(t, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unable to create template' }, { status: 500 });
    }
}
