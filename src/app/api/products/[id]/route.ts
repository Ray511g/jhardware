import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

const productUpdateSchema = z.object({
    sku: z.string().optional(),
    name: z.string().optional(),
    category: z.string().optional(),
    price: z.coerce.number().optional(),
    costPrice: z.coerce.number().optional(),
    stock: z.coerce.number().optional(),
    minStock: z.coerce.number().optional(),
    unit: z.string().optional()
});

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "inventory_edit")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const { id } = await props.params;
        const body = await req.json();
        const data = productUpdateSchema.parse(body);

        const oldProduct = await prisma.product.findUnique({ where: { id } });
        const updatedProduct = await prisma.product.update({
            where: { id },
            data
        });

        await recordAudit(
            user!.id,
            user!.name,
            "UPDATE",
            "Inventory",
            `Modified item: ${updatedProduct.name}. Changes: ${JSON.stringify(data)}`
        );

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("DEBUG: Update Product Error", error);
        return NextResponse.json({ error: error.message || "Update Failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "inventory_delete")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const { id } = await props.params;
        const product = await prisma.product.findUnique({ where: { id } });

        await prisma.product.delete({
            where: { id }
        });

        await recordAudit(
            user!.id,
            user!.name,
            "DELETE",
            "Inventory",
            `Purged item from matrix: ${product?.name || id}`
        );

        return NextResponse.json({ message: "Product deleted" });
    } catch (error: any) {
        console.error("DEBUG: Delete Product Error", error);
        return NextResponse.json({ error: error.message || "Delete Failed" }, { status: 500 });
    }
}
