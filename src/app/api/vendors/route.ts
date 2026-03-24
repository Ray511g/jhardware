import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

const vendorSchema = z.object({
    name: z.string().min(2),
    type: z.string(),
    contact: z.string(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    rating: z.number().default(5.0),
});

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "partners_view")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const vendors = await prisma.vendor.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(vendors);
    } catch (error) {
        console.error("DEBUG: GET Vendors Error Details:", error);
        return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "partners_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = vendorSchema.parse(body);

        const vendor = await prisma.vendor.create({
            data: validatedData
        });

        await recordAudit(
            user!.id,
            user!.name,
            "CREATE",
            "Vendors",
            `Onboarded new trade partner: ${vendor.name}`
        );

        return NextResponse.json(vendor, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        console.error("DEBUG: POST Vendor Error Details:", error);
        return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
    }
}
