import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Safaricom sends payment notifications to this URL after every payment to Till
// Register this URL using /api/mpesa/register

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("[MPESA C2B CALLBACK]", JSON.stringify(body, null, 2));

        // Safaricom C2B Callback Payload Structure
        const {
            TransactionType,
            TransID,           // e.g. "RBA12345XY"
            TransTime,         // e.g. "20240323221500"
            TransAmount,
            BusinessShortCode,
            BillRefNumber,     // Account reference entered by customer
            MSISDN,            // Customer phone
            FirstName,
            MiddleName,
            LastName
        } = body;

        if (!TransID || !TransAmount || !MSISDN) {
            return NextResponse.json({ ResultCode: 1, ResultDesc: "Missing required fields" });
        }

        // Parse transaction time
        const ts = String(TransTime);
        const transactedAt = new Date(
            `${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)}T${ts.slice(8,10)}:${ts.slice(10,12)}:${ts.slice(12,14)}`
        );

        // Store in DB (upsert prevents duplicates)
        await prisma.mpesaPayment.upsert({
            where: { transactionCode: TransID },
            update: {},
            create: {
                transactionCode: TransID,
                phone: String(MSISDN),
                amount: parseFloat(String(TransAmount)),
                tillNumber: String(BusinessShortCode),
                accountRef: BillRefNumber || null,
                firstName: FirstName || null,
                middleName: MiddleName || null,
                lastName: LastName || null,
                transactedAt,
                status: "unmatched"
            }
        });

        console.log(`[MPESA] Payment KES ${TransAmount} from ${MSISDN} stored. Ref: ${TransID}`);

        // Safaricom expects this exact response to acknowledge receipt
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    } catch (error: any) {
        console.error("[MPESA CALLBACK ERROR]", error);
        // Still return 200 so Safaricom doesn't keep retrying
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
}

// Safaricom validation URL (called before C2B confirmation)
export async function GET(req: Request) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
