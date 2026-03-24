import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncVendorBalance } from "@/lib/finance-utils";

export async function GET() {
    try {
        const vendor = await prisma.vendor.findFirst({
            where: { name: { contains: 'Rayzz', mode: 'insensitive' } }
        });

        if (!vendor) return NextResponse.json({ error: "Vendor Rayzz not found" });

        const newBalance = await prisma.$transaction(async (tx) => {
            return await syncVendorBalance(tx, vendor.id);
        });

        return NextResponse.json({
            success: true,
            vendor: vendor.name,
            newBalance: newBalance,
            display: `Kshs ${Math.abs(Number(newBalance)).toLocaleString()} OWED`
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
