import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

const configSchema = z.object({
    name: z.string().min(1),
    location: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    taxNumber: z.string().optional().nullable(),
    taxPercentage: z.coerce.number().default(16.0),
    taxInclusive: z.boolean().default(true),
    mpesaTill: z.string().optional().nullable(),
    mpesaPaybill: z.string().optional().nullable(),
    mpesaAccount: z.string().optional().nullable(),
});

export async function GET() {
    try {
        const user = await getCurrentUser();
        // Config reading restricted to settings_manage
        if (!hasPermission(user, "settings_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const results = await prisma.$queryRaw`SELECT * FROM "BusinessConfig" WHERE id = 'singleton' LIMIT 1` as any[];
        let config = results[0];

        if (!config) {
            await prisma.$executeRaw`INSERT INTO "BusinessConfig" (id, name, "taxPercentage", "taxInclusive", "updatedAt") VALUES ('singleton', 'BIASHARA POS', 16.0, true, NOW())`;
            const newResults = await prisma.$queryRaw`SELECT * FROM "BusinessConfig" WHERE id = 'singleton' LIMIT 1` as any[];
            config = newResults[0];
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error("DEBUG: BusinessConfig GET Error", error);
        return NextResponse.json({ error: "Configuration access failure" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "settings_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();
        const data = configSchema.parse(body);

        await prisma.$executeRaw`
            INSERT INTO "BusinessConfig" (id, name, location, phone, email, "taxNumber", "taxPercentage", "taxInclusive", "mpesaTill", "mpesaPaybill", "mpesaAccount", "updatedAt")
            VALUES ('singleton', ${data.name}, ${data.location}, ${data.phone}, ${data.email}, ${data.taxNumber}, ${data.taxPercentage}, ${data.taxInclusive}, ${data.mpesaTill}, ${data.mpesaPaybill}, ${data.mpesaAccount}, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                location = EXCLUDED.location,
                phone = EXCLUDED.phone,
                email = EXCLUDED.email,
                "taxNumber" = EXCLUDED."taxNumber",
                "taxPercentage" = EXCLUDED."taxPercentage",
                "taxInclusive" = EXCLUDED."taxInclusive",
                "mpesaTill" = EXCLUDED."mpesaTill",
                "mpesaPaybill" = EXCLUDED."mpesaPaybill",
                "mpesaAccount" = EXCLUDED."mpesaAccount",
                "updatedAt" = NOW()
        `;

        await recordAudit(
            user!.id,
            user!.name,
            "UPDATE",
            "Settings",
            `Synchronized master backbone configuration. Parameters: ${JSON.stringify(data)}`
        );

        const results = await prisma.$queryRaw`SELECT * FROM "BusinessConfig" WHERE id = 'singleton' LIMIT 1` as any[];
        return NextResponse.json(results[0]);
    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        console.error("DEBUG: BusinessConfig POST Error", error);
        return NextResponse.json({ error: "Configuration update failure" }, { status: 500 });
    }
}
