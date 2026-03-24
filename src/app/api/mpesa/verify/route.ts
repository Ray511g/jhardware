import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/mpesa/verify — Reconcile selected payment to an order
export async function POST(req: Request) {
    try {
        const { paymentId, orderId } = await req.json();

        if (!paymentId) {
            return NextResponse.json({ success: true, skipped: true });
        }

        if (!(prisma as any).mpesaPayment) {
            return NextResponse.json({ success: true, skipped: true, reason: "DB not migrated" });
        }

        const payment = await (prisma as any).mpesaPayment.update({
            where: { id: paymentId },
            data: { status: "matched", orderId: orderId || null }
        });

        if (orderId) {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    transactionRef: payment.transactionCode,
                    customerPhone: payment.phone,
                    paymentMethod: "Mpesa"
                }
            });
        }

        return NextResponse.json({ success: true, payment });

    } catch (error: any) {
        console.error("[MPESA RECONCILE ERROR]", error.message);
        // Non-blocking — don't fail the sale
        return NextResponse.json({ success: true, skipped: true, error: error.message });
    }
}

// GET /api/mpesa/verify?code=RBA12345XY
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

        if (!(prisma as any).mpesaPayment) {
            return NextResponse.json({ payment: null });
        }

        const payment = await (prisma as any).mpesaPayment.findUnique({
            where: { transactionCode: code.toUpperCase() }
        });

        return NextResponse.json({ payment });

    } catch (error: any) {
        return NextResponse.json({ payment: null, error: error.message });
    }
}
