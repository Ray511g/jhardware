import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { checkoutRequestId } = body;

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const passkey = process.env.MPESA_PASSKEY;
        const shortcode = process.env.MPESA_SHORTCODE;

        if (!consumerKey || !consumerSecret || !passkey || !shortcode || !checkoutRequestId) {
            return NextResponse.json({ status: "PENDING", message: "Missing configure/checkout ID" }, { status: 400 });
        }

        // 1. Authenticate with Daraja
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${auth}`, "Connection": "keep-alive" }
        });

        if (!tokenRes.ok) {
            throw new Error("Failed to authenticate with Daraja for status check.");
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // 2. Format Timestamp & Password
        const date = new Date();
        const timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        // 3. Query the status
        const queryUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
        const queryRes = await fetch(queryUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            })
        });

        const queryData = await queryRes.json();
        console.log("---- DARAJA STATUS PAYLOAD ----", JSON.stringify(queryData, null, 2));

        // 4. Understand Daraja Response
        // errorCode: "500.001.1001" usually means "The transaction is being processed"
        // ResultCode: "0" means Success
        // ResultCode: "1032" means Cancelled
        // ResultCode: "1" or others means Insufficient funds / Error
        // NOTE: Sometimes ResultCode comes in as a Number, not a String!
        const stringResultCode = String(queryData.ResultCode);

        // STK pushes that are currently active either throw 500.001.1001 OR ResultCode is completely missing.

        // If there's an internal Daraja fault (often a Spike Arrest / Rate Limit in Sandbox)
        if (queryData.fault) {
            return NextResponse.json({ status: "PENDING", description: "Daraja Service Fault (Rate Limit). Retrying...", data: queryData });
        }

        // If Daraja returns an error code (but 500.001.1001 means pending/processing)
        if (queryData.errorCode && queryData.errorCode !== "500.001.1001") {
            return NextResponse.json({ status: "FAILED", description: queryData.errorMessage || "M-Pesa API Error", data: queryData });
        }

        if (queryData.errorCode === "500.001.1001" || queryData.ResultCode === undefined || queryData.errorMessage?.includes("pending") || queryData.errorMessage?.includes("processing")) {
            return NextResponse.json({ status: "PENDING", description: "Waiting for user PIN", data: queryData });
        } else if (stringResultCode === "0") {
            // SUCCESS! Extract M-Pesa Receipt Number from Daraja JSON structure
            let mpesaReceiptNumber = "";
            const callbackMetadata = queryData.CallbackMetadata?.Item;
            if (callbackMetadata && Array.isArray(callbackMetadata)) {
                const receiptItem = callbackMetadata.find((item: any) => item.Name === "MpesaReceiptNumber");
                if (receiptItem) {
                    mpesaReceiptNumber = receiptItem.Value;
                }
            }

            return NextResponse.json({
                status: "SUCCESS",
                description: queryData.ResultDesc,
                mpesaReceiptNumber,
                data: queryData
            });
        } else if (queryData.ResultCode) {
            return NextResponse.json({ status: "FAILED", description: queryData.ResultDesc, data: queryData });
        }

        // Unknown/Fallback
        return NextResponse.json({ status: "PENDING", description: "Unknown Daraja state", data: queryData });

    } catch (error: any) {
        console.error("STK Query Error:", error);
        return NextResponse.json(
            { status: "ERROR", message: error.message || "Failed to query status" },
            { status: 500 }
        );
    }
}
