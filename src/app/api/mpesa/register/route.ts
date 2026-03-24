import { NextResponse } from "next/server";

// POST /api/mpesa/register — Register C2B callback URLs with Safaricom
// Call this ONCE to link your Till to your server's callback URL
export async function POST(req: Request) {
    try {
        const consumerKey = process.env.MPESA_CONSUMER_KEY!;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
        const shortcode = process.env.MPESA_SHORTCODE!;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

        if (!consumerKey || !consumerSecret || !shortcode || !appUrl) {
            return NextResponse.json({ error: "Missing M-Pesa environment variables" }, { status: 500 });
        }

        // Get auth token
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
        const tokenRes = await fetch(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            { headers: { Authorization: `Basic ${auth}` } }
        );

        if (!tokenRes.ok) {
            const txt = await tokenRes.text();
            return NextResponse.json({ error: `Auth failed: ${txt}` }, { status: 400 });
        }

        const { access_token } = await tokenRes.json();

        // Register callback URLs
        const registerRes = await fetch(
            "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ShortCode: shortcode,
                    ResponseType: "Completed",
                    ConfirmationURL: `${appUrl}/api/mpesa/callback`,
                    ValidationURL: `${appUrl}/api/mpesa/callback`
                })
            }
        );

        const registerData = await registerRes.json();
        console.log("[MPESA REGISTER]", registerData);

        return NextResponse.json({
            success: true,
            data: registerData,
            message: `C2B URLs registered for Till ${shortcode}. Payments will now be sent to ${appUrl}/api/mpesa/callback`
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        info: "Send POST to this endpoint to register C2B callback URLs with Safaricom",
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
        till: process.env.MPESA_SHORTCODE
    });
}
