import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, amount, reference } = body;

        if (!phone || !amount) {
            return NextResponse.json({ message: "Phone and Amount are required" }, { status: 400 });
        }

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
        const tillNumber = process.env.MPESA_SHORTCODE || "174379";

        // Simulation mode if credentials missing
        if (!consumerKey || !consumerSecret || !passkey || !tillNumber) {
            console.log(`[SIMULATED] M-PESA STK PUSH: Sent to ${phone} for KES ${amount}`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                message: "STK Push Initiated (Simulated)",
                success: true,
                simulated: true,
                CheckoutRequestID: `ws_CO_${Date.now()}`
            });
        }

        // ==========================================
        // PRODUCTION DARAJA API - BUY GOODS (TILL)
        // ==========================================

        // 1. Generate Auth Token (Production)
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
        const tokenRes = await fetch(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            { headers: { Authorization: `Basic ${auth}` } }
        );

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            throw new Error(`Safaricom Auth Failed: ${errText}`);
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // 2. Timestamp & Password
        const date = new Date();
        const timestamp =
            date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const password = Buffer.from(`${tillNumber}${passkey}${timestamp}`).toString("base64");

        // 3. Format Phone (07... → 2547...)
        let formattedPhone = phone.trim().replace(/\s+/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith("+")) {
            formattedPhone = formattedPhone.slice(1);
        }

        // 4. STK Push - CustomerBuyGoodsOnline for Till Number
        const stkBody = {
            BusinessShortCode: tillNumber,       // Your Till: 8052912
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerBuyGoodsOnline",  // Till/Buy Goods type
            Amount: Math.ceil(amount),
            PartyA: formattedPhone,
            PartyB: tillNumber,                  // Funds go to Till: 8052912
            PhoneNumber: formattedPhone,
            CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/api/mpesa/callback`,
            AccountReference: reference || "BIASHARA POS",
            TransactionDesc: "POS Sale Payment"
        };

        console.log("[DARAJA] STK Push Request:", JSON.stringify(stkBody, null, 2));

        const stkRes = await fetch(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(stkBody)
            }
        );

        const stkData = await stkRes.json();
        console.log("[DARAJA] STK Push Response:", JSON.stringify(stkData, null, 2));

        if (stkData.errorCode) {
            throw new Error(`Daraja Error ${stkData.errorCode}: ${stkData.errorMessage}`);
        }

        return NextResponse.json({
            message: "STK Push Initiated",
            success: true,
            simulated: false,
            CheckoutRequestID: stkData.CheckoutRequestID,
            MerchantRequestID: stkData.MerchantRequestID,
            CustomerMessage: stkData.CustomerMessage
        });

    } catch (error: any) {
        console.error("M-Pesa STK Push Error:", error);
        return NextResponse.json(
            { message: error.message || "Internal M-Pesa Server Error" },
            { status: 500 }
        );
    }
}
