import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "biashara-fallback-secret-2026";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("biashara_auth_token")?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        const staff = await prisma.staff.findUnique({
            where: { id: payload.id as string }
        });

        if (!staff || staff.status !== "Active") return null;

        return {
            id: staff.id,
            name: staff.name,
            username: staff.username,
            role: staff.role,
            permissions: staff.permissions ? JSON.parse(staff.permissions) : [],
        };
    } catch (err) {
        return null;
    }
}

export function hasPermission(user: any, permission: string) {
    if (!user) return false;
    if (user.role === "Admin") return true;
    return user.permissions.includes(permission);
}
