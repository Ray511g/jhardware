import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncVendorBalance } from "@/lib/finance-utils";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const body = await req.json();
        const { status, paymentMethod } = body;

        const result = await (prisma as any).$transaction(async (tx: any) => {
            const currentPO = await tx.purchaseOrder.findUnique({
                where: { id },
                include: { transactions: true }
            });

            if (!currentPO) throw new Error("PO not found");

            // Allow status update relative to inventory, but leverage syncVendorBalance for the money
            const dataToUpdate: any = {};
            if (status) dataToUpdate.status = status;
            if (paymentMethod) dataToUpdate.paymentMethod = paymentMethod;

            const updatedPO = await tx.purchaseOrder.update({
                where: { id },
                data: dataToUpdate,
                include: { transactions: true }
            });

            // Handle Stock Updates (One-way: Pending -> Delivered)
            const becomesDelivered = status === "Delivered" && currentPO.status !== "Delivered";
            if (becomesDelivered) {
                const items = JSON.parse(updatedPO.items);
                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: Number(item.quantity) || 0 } }
                    });
                }
            }

            // Handle Payment Method Transitions for Ledger Integrity
            const methodChangedOnDelivered = (updatedPO.status === "Delivered") &&
                paymentMethod && paymentMethod !== currentPO.paymentMethod;

            if (methodChangedOnDelivered) {
                if (currentPO.paymentMethod === "Credit" && paymentMethod === "Cash") {
                    // Record the cash injection
                    await tx.vendorTransaction.create({
                        data: {
                            vendorId: updatedPO.vendorId,
                            poId: updatedPO.id,
                            amount: updatedPO.total,
                            method: "Cash",
                            reference: `METHOD_TRANSITION: ${updatedPO.poNumber}`
                        }
                    });
                    await tx.purchaseOrder.update({
                        where: { id: updatedPO.id },
                        data: { paidAmount: updatedPO.total }
                    });
                }
            }

            // Ground Truth Sync: Recalculate everything to ensure balance matches reality
            await syncVendorBalance(tx, updatedPO.vendorId);

            return updatedPO;
        }, {
            maxWait: 10000,
            timeout: 20000
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("DEBUG: Update PO Error", error);
        return NextResponse.json({ error: error.message || "Update Failed" }, { status: 500 });
    }
}
