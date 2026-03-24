import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const vendor = await prisma.vendor.findFirst({
            where: { name: { contains: 'Rayzz', mode: 'insensitive' } },
            include: {
                pos: true,
                transactions: true
            }
        });

        if (!vendor) return NextResponse.json({ error: "No Rayzz found" });

        const deliveredTotal = vendor.pos
            .filter(p => p.status === 'Delivered')
            .reduce((sum, p) => sum + p.total, 0);

        const paymentTotal = vendor.transactions
            .reduce((sum, t) => sum + t.amount, 0);

        return NextResponse.json({
            vendorName: vendor.name,
            currentBalance: vendor.balance,
            calculatedBalance: paymentTotal - deliveredTotal,
            deliveredTotal,
            paymentTotal,
            pos: vendor.pos.map(p => ({ id: p.id, poNumber: p.poNumber, total: p.total, status: p.status, method: p.paymentMethod })),
            transactions: vendor.transactions.map(t => ({ id: t.id, amount: t.amount, date: t.date, ref: t.reference }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
