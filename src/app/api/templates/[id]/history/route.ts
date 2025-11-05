import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";

export async function GET(request: Request, context: { params: any }) {
    try {
        const id = context.params?.id;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const audits = await prisma.audit.findMany({ where: { entity: 'Template', entityId: id }, orderBy: { createdAt: 'desc' } });
        return NextResponse.json(audits);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unable to fetch history' }, { status: 500 });
    }
}
