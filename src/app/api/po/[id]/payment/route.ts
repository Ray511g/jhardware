import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncVendorBalance } from "@/lib/finance-utils";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const body = await req.json();
        const { amount: rawAmount, method, reference } = body;
        const amount = Number(rawAmount);

        if (isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: "Invalid currency injection amount" }, { status: 400 });
        }

        const result = await (prisma as any).$transaction(async (tx: any) => {
            const po = await tx.purchaseOrder.findUnique({
                where: { id },
                include: { vendor: true }
            });

            if (!po) throw new Error("Manifest not found");

            // 1. Record Ground Truth Payment
            const transaction = await tx.vendorTransaction.create({
                data: {
                    vendorId: po.vendorId,
                    poId: po.id,
                    amount,
                    method,
                    reference: reference || `PO_PAYMENT: ${po.poNumber}`
                }
            });

            // 2. Update PO metadata
            await tx.purchaseOrder.update({
                where: { id },
                data: { paidAmount: { increment: amount } }
            });

            // 3. AUTOMATIC BALANCE SYNC
            // Recalculates total paid vs total delivered for this vendor
            await syncVendorBalance(tx, po.vendorId);

            return transaction;
        }, {
            maxWait: 10000,
            timeout: 20000
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error("DEBUG: PO Payment Error", error);
        return NextResponse.json({ error: error.message || "Payment Failed" }, { status: 500 });
    }
}
