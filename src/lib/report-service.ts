import { prisma } from "@/lib/prisma";

export async function getSalesSummary(from: Date, to: Date) {
    const orders = await prisma.order.findMany({
        where: {
            date: { gte: from, lte: to },
            status: "Completed"
        },
        include: {
            items: {
                include: { product: true }
            }
        },
        orderBy: { date: 'desc' }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;

    return {
        orders,
        stats: {
            totalRevenue,
            orderCount,
            averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0
        }
    };
}

export async function getInventoryAudit() {
    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' }
    });

    const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const lowStockItems = products.filter(p => p.stock <= p.minStock);

    return {
        products,
        stats: {
            totalValuation,
            itemCount: products.length,
            lowStockCount: lowStockItems.length
        }
    };
}

export async function getPurchaseOrderReport(from: Date, to: Date) {
    const pos = await prisma.purchaseOrder.findMany({
        where: {
            date: { gte: from, lte: to }
        },
        include: {
            vendor: true
        },
        orderBy: { date: 'desc' }
    });

    return { pos };
}

export async function getFinancialStatement(from: Date, to: Date) {
    const orders = await prisma.order.findMany({
        where: {
            date: { gte: from, lte: to },
            status: "Completed"
        }
    });

    const expenses = await prisma.expense.findMany({
        where: {
            date: { gte: from, lte: to }
        }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        expenseDetails: expenses
    };
}

export async function getVendorPerformance() {
    const vendors = await prisma.vendor.findMany({
        include: {
            pos: true
        }
    });

    return { vendors };
}

export async function getContractorAging() {
    const contractors = await prisma.contractor.findMany({
        include: {
            transactions: {
                orderBy: { date: 'desc' }
            }
        }
    });

    // Simple aging: total balance vs last payment date
    return { contractors };
}
