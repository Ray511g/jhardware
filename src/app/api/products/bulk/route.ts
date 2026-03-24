import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid items array" }, { status: 400 });
        }

        const stats = { created: 0, updated: 0 };

        for (const item of items) {
            const existing = await prisma.product.findFirst({
                where: { name: { equals: item.name, mode: 'insensitive' } }
            });

            if (existing) {
                await prisma.product.update({
                    where: { id: existing.id },
                    data: {
                        stock: { increment: parseFloat(item.stock) || 0 },
                        price: parseFloat(item.price) || existing.price,
                        costPrice: parseFloat(item.costPrice) || existing.costPrice,
                    }
                });
                stats.updated++;
            } else {
                await prisma.product.create({
                    data: {
                        name: item.name,
                        stock: parseFloat(item.stock) || 0,
                        price: parseFloat(item.price) || 0,
                        costPrice: parseFloat(item.costPrice) || 0,
                        category: item.category || "General",
                        unit: item.unit || "pcs",
                        minStock: 5
                    }
                });
                stats.created++;
            }
        }

        return NextResponse.json({
            success: true,
            count: stats.created + stats.updated,
            stats,
            message: `Successfully processed ${stats.created + stats.updated} items.`
        });

    } catch (error: any) {
        console.error("[BULK IMPORT ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
