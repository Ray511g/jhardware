import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

        // 1. BEST SELLERS (Last 30 Days)
        const bestSellersData = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            where: {
                order: {
                    date: { gte: thirtyDaysAgo },
                    status: "Completed"
                }
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 10
        });

        // Enrich best sellers with product names
        const bestSellers = await Promise.all(bestSellersData.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, sku: true, price: true }
            });
            return {
                ...item,
                name: product?.name || "Unknown",
                sku: product?.sku || "N/A",
                revenue: (item._sum.quantity || 0) * (product?.price || 0)
            };
        }));

        // 2. DEAD STOCK (No sales in 90 days, but have stock)
        // Find products sold in last 90 days
        const soldIn90Days = await prisma.orderItem.findMany({
            where: {
                order: {
                    date: { gte: ninetyDaysAgo },
                    status: "Completed"
                }
            },
            select: { productId: true },
            distinct: ['productId']
        });
        const soldIds = soldIn90Days.map(s => s.productId);

        const deadStock = await prisma.product.findMany({
            where: {
                id: { notIn: soldIds },
                stock: { gt: 0 }
            },
            orderBy: {
                stock: 'desc'
            },
            take: 10,
            select: {
                name: true,
                sku: true,
                stock: true,
                costPrice: true,
                createdAt: true
            }
        });

        // 3. REVENUE TRENDS (Last 14 Days)
        const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
        const dailyRevenue = await prisma.order.groupBy({
            by: ['date'],
            _sum: {
                total: true
            },
            where: {
                date: { gte: fourteenDaysAgo },
                status: "Completed"
            }
        });

        // 4. INVENTORY HEALTH
        const totalProducts = await prisma.product.count();
        const lowStockCount = await prisma.product.count({
            where: {
                stock: { lte: prisma.product.fields.minStock }
            }
        });

        return NextResponse.json({
            bestSellers,
            deadStock,
            revenueTrends: dailyRevenue,
            health: {
                totalProducts,
                lowStockCount,
                healthScore: totalProducts > 0 ? Math.round(((totalProducts - lowStockCount) / totalProducts) * 100) : 100
            }
        });
    } catch (error: any) {
        console.error("Analytics Engine Failure:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
