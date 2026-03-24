import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "pos_terminal")) { // Basic check for now, should ideally be high level
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        // Aggregate ALL critical business data for redundant storage
        const payload = {
            timestamp: new Date().toISOString(),
            version: "2026.1",
            matrix: {
                products: await prisma.product.findMany(),
                vendors: await prisma.vendor.findMany(),
                contractors: await prisma.contractor.findMany(),
                staff: await prisma.staff.findMany({
                    select: { id: true, name: true, username: true, role: true, status: true } // No passwords in backup
                }),
                orders: await prisma.order.findMany({
                    include: { items: true },
                    take: 1000, // Last 1000 orders for redundancy
                    orderBy: { date: 'desc' }
                }),
                purchaseOrders: await prisma.purchaseOrder.findMany({
                    take: 200,
                    orderBy: { date: 'desc' }
                }),
                transactions: {
                    vendor: await (prisma as any).vendorTransaction.findMany({ take: 500, orderBy: { date: 'desc' } }),
                    contractor: await (prisma as any).contractorTransaction.findMany({ take: 500, orderBy: { date: 'desc' } })
                },
                config: await prisma.businessConfig.findFirst()
            }
        };

        return NextResponse.json(payload);
    } catch (error: any) {
        console.error("Backup Protocol Failure:", error);
        return NextResponse.json({ error: "Data extraction failed" }, { status: 500 });
    }
}
