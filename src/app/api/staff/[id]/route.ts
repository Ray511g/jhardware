import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "staff_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const { id } = await props.params;
        const body = await req.json();
        const { name, username, password, role, permissions, status, shifts } = body;

        const data: any = {};
        if (name) data.name = name;
        if (username) data.username = username;
        if (role) data.role = role;
        if (permissions) data.permissions = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);
        if (status) data.status = status;
        if (shifts) data.shifts = shifts;

        // If password is provided, hash it for reset
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const staff = await prisma.staff.update({
            where: { id },
            data
        });

        await recordAudit(
            user!.id,
            user!.name,
            "UPDATE",
            "Staff",
            `Modified specialist node: ${staff.name}. Action: ${JSON.stringify(data)}`
        );

        return NextResponse.json({
            ...staff,
            permissions: staff.permissions ? JSON.parse(staff.permissions) : []
        });
    } catch (error) {
        console.error("DEBUG: PUT Staff Error:", error);
        return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "staff_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const { id } = await props.params;
        const staff = await prisma.staff.findUnique({ where: { id } });

        await prisma.staff.delete({
            where: { id }
        });

        await recordAudit(
            user!.id,
            user!.name,
            "DELETE",
            "Staff",
            `Purged specialist node from matrix: ${staff?.name || id}`
        );

        return NextResponse.json({ message: "Staff deleted" });
    } catch (error) {
        console.error("DEBUG: DELETE Staff Error:", error);
        return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
    }
}
