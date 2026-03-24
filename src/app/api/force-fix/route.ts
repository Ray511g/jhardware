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

        if (!vendor) return NextResponse.json({ error: "Vendor not found" });

        // GROUND TRUTH RECALCULATION
        const deliveredPOs = vendor.pos.filter(p => p.status === 'Delivered');
        const totalLiability = deliveredPOs.reduce((s, p) => s + p.total, 0);

        // Count ONLY payments that are either general OR tied to a DELIVERED PO
        const validPayments = vendor.transactions.filter(t => {
            if (!t.poId) return true; // General payment
            const po = vendor.pos.find(p => p.id === t.poId);
            return po && po.status === 'Delivered'; // Only count payment if goods received
        });
        const totalPayments = validPayments.reduce((s, t) => s + t.amount, 0);

        const targetBalance = totalPayments - totalLiability;

        // FORCE UPDATE
        await prisma.vendor.update({
            where: { id: vendor.id },
            data: { balance: targetBalance }
        });

        return NextResponse.json({
            status: "SUCCESS",
            vendor: vendor.name,
            newBalance: targetBalance,
            math: {
                liabilities: totalLiability,
                payments: totalPayments,
                calc: `${totalPayments} - ${totalLiability} = ${targetBalance}`
            },
            dataDump: {
                delivered: deliveredPOs.map(p => ({ no: p.poNumber, total: p.total })),
                paymentsCounted: validPayments.map(t => ({ amount: t.amount, ref: t.reference }))
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
