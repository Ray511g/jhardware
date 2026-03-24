import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const envKeys = Object.keys(process.env);
        const hasDbUrl = !!process.env.DATABASE_URL;
        
        // Test a simple query
        const staffCount = await prisma.staff.count();
        
        return NextResponse.json({
            status: "Online",
            database: "Connected",
            staffCount,
            envKeysFound: envKeys.filter(k => k.includes("DATABASE") || k.includes("URL") || k.includes("SECRET")),
            hasDbUrl
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "Error",
            message: error.message,
            stack: error.stack,
            envKeysFound: Object.keys(process.env).filter(k => k.includes("DATABASE") || k.includes("URL") || k.includes("SECRET"))
        }, { status: 500 });
    }
}
