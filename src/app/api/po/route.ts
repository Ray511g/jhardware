import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncVendorBalance } from "@/lib/finance-utils";

export async function GET() {
    try {
        const pos = await (prisma as any).purchaseOrder.findMany({
            include: {
                vendor: true,
                transactions: true
            },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(pos);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch POs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { poNumber, vendorId, total, items, status, paymentMethod } = body;

        const result = await (prisma as any).$transaction(async (tx: any) => {
            const po = await tx.purchaseOrder.create({
                data: {
                    poNumber,
                    vendorId,
                    total,
                    items: JSON.stringify(items),
                    status: status || "Pending",
                    paymentMethod: paymentMethod || "Credit",
                    paidAmount: paymentMethod === "Cash" ? total : 0
                }
            });

            // If it's cash, we create a transaction immediately
            if (paymentMethod === "Cash") {
                await tx.vendorTransaction.create({
                    data: {
                        vendorId,
                        poId: po.id,
                        amount: total,
                        method: "Cash",
                        reference: `INSTANT_PAY: ${poNumber}`
                    }
                });
            }

            // If delivered, update stock
            if (status === "Delivered") {
                const poItems = items || [];
                for (const item of poItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: Number(item.quantity) || 0 } }
                    });
                }
            }

            // ALWAYS sync the vendor balance after any change to ground-truth records
            await syncVendorBalance(tx, vendorId);

            return po;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("DEBUG: POST PO Error Details:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: `Failed to create PO: ${errorMessage}` }, { status: 500 });
    }
}
