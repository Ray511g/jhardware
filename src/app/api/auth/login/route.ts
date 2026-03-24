import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Note: These need to be installed: npm install bcryptjs jose
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { recordAudit } from "@/lib/audit";

const JWT_SECRET = process.env.JWT_SECRET || "biashara-fallback-secret-2026";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { message: "Missing credentials" },
                { status: 400 }
            );
        }

        const staff = await prisma.staff.findUnique({
            where: { username },
        });

        if (!staff) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, staff.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create JWT
        const token = await new SignJWT({
            id: staff.id,
            username: staff.username,
            role: staff.role
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(new TextEncoder().encode(JWT_SECRET));

        // Update last seen
        await prisma.staff.update({
            where: { id: staff.id },
            data: { lastSeen: new Date() },
        });

        await recordAudit(
            staff.id,
            staff.name,
            "LOGIN",
            "Auth",
            `Personnel node synchronized with system from ${req.headers.get("user-agent") || "Unknown"}`
        );

        const response = NextResponse.json({
            message: "Login successful",
            user: {
                id: staff.id,
                name: staff.name,
                username: staff.username,
                role: staff.role,
                permissions: staff.permissions ? JSON.parse(staff.permissions) : [],
            },
            token,
        });

        response.cookies.set({
            name: "biashara_auth_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
