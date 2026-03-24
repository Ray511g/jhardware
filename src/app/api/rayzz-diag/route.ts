import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const vendor = await prisma.vendor.findFirst({
            where: { name: { contains: 'Rayzz', mode: 'insensitive' } },
            include: { transactions: true, pos: true }
        });

        if (!vendor) return NextResponse.json({ error: "Rayzz not found" });

        return NextResponse.json({
            vendor: vendor.name,
            balance: vendor.balance,
            transactions: vendor.transactions,
            pos: vendor.pos.map(p => ({ id: p.id, no: p.poNumber, status: p.status, total: p.total }))
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
