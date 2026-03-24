import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "settings_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();
        const { confirmation } = body;

        if (confirmation !== "RESET") {
            return NextResponse.json({ error: "Invalid confirmation code" }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.orderItem.deleteMany(),
            prisma.order.deleteMany(),
            prisma.purchaseOrder.deleteMany(),
            prisma.expense.deleteMany(),
            prisma.contractorTransaction.deleteMany(),
            prisma.contractor.updateMany({ data: { balance: 0 } }),
            prisma.product.updateMany({ data: { stock: 0 } }),
            prisma.vendor.updateMany({ data: { balance: 0 } })
        ]);

        await recordAudit(
            user!.id,
            user!.name,
            "VOID",
            "Settings",
            "CRITICAL: Executed master system reset. All transactional data purged."
        );

        return NextResponse.json({ success: true, message: "System core reset successfully." });
    } catch (error) {
        console.error("DEBUG: System Reset Error", error);
        return NextResponse.json({ error: "System reset failure" }, { status: 500 });
    }
}
