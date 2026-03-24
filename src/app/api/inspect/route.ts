import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const vendor = await prisma.vendor.findFirst({
            where: { name: { contains: 'Rayzz', mode: 'insensitive' } },
            include: {
                pos: {
                    include: { transactions: true }
                },
                transactions: true
            }
        });

        if (!vendor) return NextResponse.json({ error: "Vendor not found" });

        return NextResponse.json({
            vendorName: vendor.name,
            dbBalance: vendor.balance,
            pos: vendor.pos.map(p => ({
                id: p.id,
                no: p.poNumber,
                status: p.status,
                method: p.paymentMethod,
                total: p.total,
                paid: p.paidAmount
            })),
            transactions: vendor.transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                ref: t.reference,
                poId: t.poId
            }))
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
