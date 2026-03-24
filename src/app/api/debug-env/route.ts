import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        url: process.env.DATABASE_URL,
        node_env: process.env.NODE_ENV
    });
}
