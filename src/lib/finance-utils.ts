import { prisma } from "./prisma";

/**
 * Re-calculates a vendor's balance based on ground-truth records:
 * Balance = (Total Payments) - (Total Value of Delivered Goods)
 * 
 * @param tx Prisma Transaction Client
 * @param vendorId The ID of the vendor to resync
 */
export async function syncVendorBalance(tx: any, vendorId: string) {
    const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
        include: {
            pos: {
                where: { status: "Delivered" }
            },
            transactions: true
        }
    });

    if (!vendor) return;

    // 1. Sum up all goods we have physically received (Historical Liability)
    const totalLiabilities = vendor.pos.reduce((sum: number, po: any) => sum + po.total, 0);

    // 2. Sum up payments (Exclude transactions that don't match delivered goods)
    const validTransactions = vendor.transactions.filter((t: any) => {
        if (t.poId) {
            // Only count if the manifest is officially Received (Delivered)
            return vendor.pos.some((p: any) => p.id === t.poId);
        }
        // General payments are counted, but maybe there's a ghost 19k here?
        return true;
    });

    const totalPayments = validTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);

    // 3. Current Standing = What we paid vs What we received
    const newBalance = totalPayments - totalLiabilities;

    await tx.vendor.update({
        where: { id: vendorId },
        data: { balance: newBalance }
    });

    return newBalance;
}
