import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

const orderSchema = z.object({
    total: z.coerce.number(),
    paymentMethod: z.string(),
    contractorId: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    transactionRef: z.string().optional(),
    buyerKraPin: z.string().optional(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.coerce.number(),
        price: z.coerce.number()
    }))
});

export async function GET() {
    try {
        const user = await getCurrentUser();
        // Permission check: pos_terminal for sales history access
        if (!hasPermission(user, "pos_terminal")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const orders = await prisma.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { date: 'desc' },
            take: 100
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "pos_terminal")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();
        const { total, paymentMethod, contractorId, customerName, customerPhone, transactionRef, buyerKraPin, items } = orderSchema.parse(body);

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    total,
                    paymentMethod,
                    contractorId,
                    customerName,
                    customerPhone,
                    transactionRef,
                    buyerKraPin,
                    status: "Completed",
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: { items: { include: { product: true } } }
            });

            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            if (contractorId && paymentMethod === "Credit") {
                await tx.contractor.update({
                    where: { id: contractorId },
                    data: { balance: { increment: total } }
                });

                await tx.contractorTransaction.create({
                    data: {
                        contractorId,
                        amount: total,
                        type: "Credit",
                        reference: orderNumber
                    }
                });
            }

            return order;
        });

        await recordAudit(
            user!.id,
            user!.name,
            "CREATE",
            "POS",
            `Executed terminal transaction ${orderNumber}. Total: KES ${total}`
        );

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("DEBUG: POS Transaction Error", error);
        return NextResponse.json({ error: "Transaction Failed" }, { status: 500 });
    }
}
