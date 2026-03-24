import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/mpesa/payments?amount=1500&minutes=60
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const amount = searchParams.get("amount");
        const minutes = parseInt(searchParams.get("minutes") || "120");

        const since = new Date(Date.now() - minutes * 60 * 1000);

        const where: any = {
            status: "unmatched",
            transactedAt: { gte: since }
        };

        if (amount) {
            const amt = parseFloat(amount);
            const tolerance = amt * 0.05;
            where.amount = { gte: amt - tolerance, lte: amt + tolerance };
        }

        // Guard: model may not exist if migration hasn't run
        if (!(prisma as any).mpesaPayment) {
            return NextResponse.json({
                payments: [],
                warning: "MpesaPayment table not yet created. Run: npx prisma migrate dev"
            });
        }

        const payments = await (prisma as any).mpesaPayment.findMany({
            where,
            orderBy: { transactedAt: "desc" },
            take: 50
        });

        return NextResponse.json({ payments });

    } catch (error: any) {
        console.error("[MPESA PAYMENTS ERROR]", error.message);
        // Graceful fallback — don't crash the page
        return NextResponse.json({ payments: [], error: error.message });
    }
}

// POST /api/mpesa/payments — Manually register a payment by receipt code
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transactionCode, phone, amount } = body;

        if (!transactionCode || !amount) {
            return NextResponse.json({ error: "Transaction code and amount required" }, { status: 400 });
        }

        if (!(prisma as any).mpesaPayment) {
            return NextResponse.json({
                error: "Database not ready. Run: npx prisma migrate dev --name add_mpesa_payments"
            }, { status: 503 });
        }

        const shortcode = process.env.MPESA_SHORTCODE || "5274604";

        const payment = await (prisma as any).mpesaPayment.upsert({
            where: { transactionCode: transactionCode.trim().toUpperCase() },
            update: { status: "unmatched" },
            create: {
                transactionCode: transactionCode.trim().toUpperCase(),
                phone: phone?.trim() || "Unknown",
                amount: parseFloat(String(amount)),
                tillNumber: shortcode,
                status: "unmatched"
            }
        });

        return NextResponse.json({ payment, verified: false });

    } catch (error: any) {
        console.error("[MPESA MANUAL ADD ERROR]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
