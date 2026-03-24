import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

const productSchema = z.object({
    sku: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    stock: z.coerce.number().default(0),
    minStock: z.coerce.number().default(0),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    costPrice: z.coerce.number().min(0, "Cost Price must be at least 0"),
    unit: z.string().min(1, "Unit is required")
});

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("DEBUG: GET Products Error Details:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: `Failed to fetch products: ${errorMessage}` }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "inventory_edit")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = productSchema.parse(body);

        // Auto-generate SKU if not provided
        if (!validatedData.sku) {
            const prefix = validatedData.category.slice(0, 3).toUpperCase();
            const random = Math.random().toString(36).substring(2, 7).toUpperCase();
            validatedData.sku = `HW-${prefix}-${random}`;
        }

        const existing = await prisma.product.findUnique({
            where: { sku: validatedData.sku }
        });

        if (existing) {
            return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: validatedData
        });

        await recordAudit(
            user!.id,
            user!.name,
            "CREATE",
            "Inventory",
            `Introduced new hardware to matrix: ${product.name} (${product.sku})`
        );

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            return NextResponse.json({ error: `Validation failed: ${messages}` }, { status: 400 });
        }
        console.error("DEBUG: POST Product Error", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: `Critical internal server failure: ${errorMessage}` }, { status: 500 });
    }
}
