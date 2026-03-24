import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

const contractorSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
});

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "partners_view")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const contractors = await prisma.contractor.findMany({
            include: { transactions: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(contractors);
    } catch (error) {
        console.error("DEBUG: GET Contractors Error Details:", error);
        return NextResponse.json({ error: "Failed to fetch contractors" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "partners_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();
        const { name, phone } = contractorSchema.parse(body);

        const contractor = await prisma.contractor.create({
            data: { name, phone, balance: 0 }
        });

        await recordAudit(
            user!.id,
            user!.name,
            "CREATE",
            "Contractors",
            `Registered new specialist contractor: ${contractor.name}`
        );

        return NextResponse.json(contractor, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        console.error("DEBUG: POST Contractor Error Details:", error);
        return NextResponse.json({ error: "Failed to create contractor" }, { status: 500 });
    }
}
