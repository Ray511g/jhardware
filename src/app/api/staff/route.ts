import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "staff_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const staff = await prisma.staff.findMany({
            orderBy: { name: 'asc' }
        });

        const parsedStaff = staff.map(s => {
            let parsedPerms = [];
            try {
                parsedPerms = s.permissions ? JSON.parse(s.permissions) : [];
                if (!Array.isArray(parsedPerms)) parsedPerms = [];
            } catch (e) {
                // Ignore malformed JSON
            }
            return {
                ...s,
                permissions: parsedPerms
            };
        });

        return NextResponse.json(parsedStaff);
    } catch (error) {
        console.error("DEBUG: GET Staff Error Details:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: `Failed to fetch staff: ${errorMessage}` }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "staff_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();
        const { name, username, password, role, permissions, shifts } = body;

        // Hash password if provided
        const hashedPassword = await bcrypt.hash(password || "staff123", 10);

        const staff = await prisma.staff.create({
            data: {
                name,
                username,
                password: hashedPassword,
                role: role || "Staff",
                permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions || []),
                status: "Active",
                shifts: shifts || "Morning"
            }
        });

        await recordAudit(
            user!.id,
            user!.name,
            "CREATE",
            "Staff",
            `Introduced new specialist to matrix: ${staff.name} (${staff.role})`
        );

        return NextResponse.json(staff, { status: 201 });
    } catch (error) {
        console.error("DEBUG: POST Staff Error Details:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: `Failed to register staff: ${errorMessage}` }, { status: 500 });
    }
}
