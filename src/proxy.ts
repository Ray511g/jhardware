import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "biashara-fallback-secret-2026";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("biashara_auth_token")?.value;
    const { pathname } = request.nextUrl;

    // 1. Allow access to login page and auth APIs + MPESA
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth") || pathname.startsWith("/api/mpesa") || pathname.includes("public") || pathname.includes("favicon.ico")) {
        return NextResponse.next();
    }

    // 2. Protect all other routes
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        // Verify token
        await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        return NextResponse.next();
    } catch (err) {
        // Token expired or invalid
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};
