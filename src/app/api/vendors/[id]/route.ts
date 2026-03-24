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

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "partners_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const { id } = await props.params;
        const body = await req.json();
        const validatedData = vendorSchema.parse(body);

        const vendor = await prisma.vendor.update({
            where: { id },
            data: validatedData
        });

        await recordAudit(
            user!.id,
            user!.name,
            "UPDATE",
            "Vendors",
            `Modified profile for trade partner: ${vendor.name}`
        );

        return NextResponse.json(vendor);
    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        console.error("DEBUG: PUT Vendor Error:", error);
        return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "partners_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const { id } = await props.params;
        const vendor = await prisma.vendor.findUnique({ where: { id } });

        await prisma.vendor.delete({
            where: { id }
        });

        await recordAudit(
            user!.id,
            user!.name,
            "DELETE",
            "Vendors",
            `Purged trade partner from network: ${vendor?.name || id}`
        );

        return NextResponse.json({ message: "Vendor deleted" });
    } catch (error) {
        console.error("DEBUG: DELETE Vendor Error:", error);
        return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
    }
}
