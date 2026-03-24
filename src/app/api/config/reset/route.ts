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
            // 1. Purge Sales & Transactions (Child records first)
            prisma.orderItem.deleteMany(),
            prisma.order.deleteMany(),
            
            // 2. Purge Procurement & Vendor Transactions
            prisma.vendorTransaction.deleteMany(),
            prisma.purchaseOrder.deleteMany(),
            
            // 3. Purge Credit & Contractor Transactions
            prisma.contractorTransaction.deleteMany(),
            prisma.contractor.deleteMany(),
            
            // 4. Purge Finance & Payments
            prisma.expense.deleteMany(),
            prisma.mpesaPayment.deleteMany(),
            
            // 5. Purge Inventory
            prisma.product.deleteMany(),
            
            // 6. Purge Partners
            prisma.vendor.deleteMany(),
            
            // 7. Purge System History
            prisma.auditLog.deleteMany()
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
