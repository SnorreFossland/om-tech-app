import { NextResponse } from "next/server";
import { prisma } from "@/auth/prisma";
import bcrypt from "bcryptjs";

// Dev-only ownership check endpoint.
// Creates two users and a template, then simulates update/delete attempts
// as both users and returns a report. ONLY available in non-production.
export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    try {
        // Create two users (owner and other)
        const ownerEmail = "dev-owner@example.test";
        const otherEmail = "dev-other@example.test";

        const pwHash = await bcrypt.hash("devpassword", 8);

        const owner = await prisma.user.upsert({
            where: { email: ownerEmail },
            update: { password: pwHash, name: "Dev Owner" },
            create: { email: ownerEmail, password: pwHash, name: "Dev Owner" },
        });

        const other = await prisma.user.upsert({
            where: { email: otherEmail },
            update: { password: pwHash, name: "Dev Other" },
            create: { email: otherEmail, password: pwHash, name: "Dev Other" },
        });

        // Create a template owned by owner
        const template = await prisma.template.create({
            data: {
                name: "dev-template",
                description: "created for dev ownership check",
                schema: { sections: [] },
                createdBy: owner.id,
            },
        });

        // Simulate owner update/delete checks (should be allowed)
        const existing = await prisma.template.findUnique({ where: { id: template.id } });

        const ownerCanUpdate = existing && (existing.createdBy === owner.id || existing.createdBy === owner.email);
        const otherCanUpdate = existing && (existing.createdBy === other.id || existing.createdBy === other.email);

        // Attempt to update with owner identity (simulate allowed path)
        let ownerUpdateResult: any = null;
        try {
            if (!ownerCanUpdate) throw new Error("Forbidden");
            const updated = await prisma.template.update({
                where: { id: template.id },
                data: { description: "updated by owner", version: { increment: 1 }, updatedBy: owner.id },
            });
            ownerUpdateResult = { ok: true, updated };
        } catch (e: any) {
            ownerUpdateResult = { ok: false, error: e?.message ?? String(e) };
        }

        // Attempt to update with other identity (simulate forbidden path)
        let otherUpdateResult: any = null;
        try {
            if (!otherCanUpdate) throw new Error("Forbidden");
            const updated = await prisma.template.update({
                where: { id: template.id },
                data: { description: "updated by other", version: { increment: 1 }, updatedBy: other.id },
            });
            otherUpdateResult = { ok: true, updated };
        } catch (e: any) {
            otherUpdateResult = { ok: false, error: e?.message ?? String(e) };
        }

        // Attempt delete as other (should fail)
        let otherDeleteResult: any = null;
        try {
            if (!otherCanUpdate) throw new Error("Forbidden");
            await prisma.template.delete({ where: { id: template.id } });
            otherDeleteResult = { ok: true };
        } catch (e: any) {
            otherDeleteResult = { ok: false, error: e?.message ?? String(e) };
        }

        // Attempt delete as owner (should succeed)
        let ownerDeleteResult: any = null;
        try {
            // recreate template if other deleted it (unlikely), otherwise delete
            const t = await prisma.template.findUnique({ where: { id: template.id } });
            if (!t) {
                ownerDeleteResult = { ok: false, error: "template already removed" };
            } else {
                await prisma.template.delete({ where: { id: template.id } });
                ownerDeleteResult = { ok: true };
            }
        } catch (e: any) {
            ownerDeleteResult = { ok: false, error: e?.message ?? String(e) };
        }

        return NextResponse.json({
            owner: { id: owner.id, email: owner.email },
            other: { id: other.id, email: other.email },
            template: { id: template.id, createdBy: template.createdBy },
            checks: { ownerCanUpdate, otherCanUpdate },
            results: { ownerUpdateResult, otherUpdateResult, otherDeleteResult, ownerDeleteResult },
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
