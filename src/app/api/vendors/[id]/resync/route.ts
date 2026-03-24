import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { syncVendorBalance } from "@/lib/finance-utils";

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (user?.role !== "Admin") {
            return NextResponse.json({ error: "High-level clearance required" }, { status: 403 });
        }

        const { id } = await props.params;

        const newBalance = await prisma.$transaction(async (tx) => {
            return await syncVendorBalance(tx, id);
        });

        return NextResponse.json({ success: true, balance: newBalance });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
