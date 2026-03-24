import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logout successful" });

    // Clear the auth cookie
    response.cookies.set({
        name: "biashara_auth_token",
        value: "",
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });

    return response;
}
