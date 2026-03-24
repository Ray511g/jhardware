import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const HARDWARE_MATRIX = [
    // CEMENT
    { name: "Bamburi Tembo Cement (50kg)", category: "Cement", unit: "Bag", price: 850, costPrice: 780 },
    { name: "Savanna Cement (50kg)", category: "Cement", unit: "Bag", price: 820, costPrice: 750 },
    { name: "Rhino Cement (50kg)", category: "Cement", unit: "Bag", price: 800, costPrice: 730 },
    { name: "Blue Triangle Cement (50kg)", category: "Cement", unit: "Bag", price: 830, costPrice: 760 },

    // STEEL & IRON
    { name: "D8 Twisted Steel Bar (12m)", category: "Steel & Iron", unit: "Piece", price: 650, costPrice: 580 },
    { name: "D10 Twisted Steel Bar (12m)", category: "Steel & Iron", unit: "Piece", price: 950, costPrice: 870 },
    { name: "D12 Twisted Steel Bar (12m)", category: "Steel & Iron", unit: "Piece", price: 1450, costPrice: 1320 },
    { name: "R6 Round Bar (12m)", category: "Steel & Iron", unit: "Piece", price: 450, costPrice: 380 },
    { name: "BRC Mesh A142", category: "Steel & Iron", unit: "Roll", price: 25000, costPrice: 22000 },

    // ROOFING
    { name: "Galsheet Box Profile 2m (G28)", category: "Roofing", unit: "Piece", price: 1200, costPrice: 1050 },
    { name: "Galsheet Wave Pattern 2m (G30)", category: "Roofing", unit: "Piece", price: 950, costPrice: 820 },
    { name: "Colored Mabati (Charcoal Grey) 3m", category: "Roofing", unit: "Piece", price: 2800, costPrice: 2450 },
    { name: "Roofing Nails (per kg)", category: "Roofing", unit: "Kg", price: 250, costPrice: 180 },
    { name: "Valley Tray (2.4m)", category: "Roofing", unit: "Piece", price: 850, costPrice: 700 },

    // PLUMBING
    { name: "PVC Pipe 1/2 inch PN10", category: "Plumbing", unit: "Piece", price: 250, costPrice: 180 },
    { name: "PVC Pipe 3/4 inch PN10", category: "Plumbing", unit: "Piece", price: 380, costPrice: 280 },
    { name: "Waste Pipe 4 inch", category: "Plumbing", unit: "Piece", price: 1200, costPrice: 950 },
    { name: "Pillar Tap (Generic)", category: "Plumbing", unit: "Piece", price: 650, costPrice: 450 },
    { name: "Bib Tap (Generic)", category: "Plumbing", unit: "Piece", price: 450, costPrice: 320 },
    { name: "Toilet Set (Complete)", category: "Plumbing", unit: "Piece", price: 8500, costPrice: 6500 },
    { name: "Kitchen Sink (Single)", category: "Plumbing", unit: "Piece", price: 3500, costPrice: 2800 },

    // ELECTRICAL
    { name: "Conduit Pipe 20mm (Heavy)", category: "Electrical", unit: "Piece", price: 120, costPrice: 85 },
    { name: "One Gang Switch (Classic)", category: "Electrical", unit: "Piece", price: 150, costPrice: 110 },
    { name: "Double Socket (13A)", category: "Electrical", unit: "Piece", price: 350, costPrice: 240 },
    { name: "Twin Tower Cable 1.5mm (per roll)", category: "Electrical", unit: "Roll", price: 4500, costPrice: 3800 },
    { name: "Twin Tower Cable 2.5mm (per roll)", category: "Electrical", unit: "Roll", price: 6800, costPrice: 5900 },
    { name: "Bulkhead Fitting (Circular)", category: "Electrical", unit: "Piece", price: 850, costPrice: 600 },

    // PAINT
    { name: "Crown Vinyl Matt White (4L)", category: "Paint", unit: "Litre", price: 2400, costPrice: 1950 },
    { name: "Crown Gloss White (4L)", category: "Paint", unit: "Litre", price: 3200, costPrice: 2750 },
    { name: "Basco Soft White (20L)", category: "Paint", unit: "Litre", price: 8500, costPrice: 7200 },
    { name: "Undercoat White (4L)", category: "Paint", unit: "Litre", price: 1200, costPrice: 950 },
    { name: "Kerosene (for thinning 1L)", category: "Paint", unit: "Litre", price: 220, costPrice: 180 },

    // TIMBER
    { name: "Timber 2x2 (per ft)", category: "Timber", unit: "Ft", price: 45, costPrice: 35 },
    { name: "Timber 3x2 (per ft)", category: "Timber", unit: "Ft", price: 65, costPrice: 52 },
    { name: "Timber 4x2 (per ft)", category: "Timber", unit: "Ft", price: 85, costPrice: 68 },
    { name: "Fascia Board (per ft)", category: "Timber", unit: "Ft", price: 150, costPrice: 120 },

    // FASTENERS & OTHERS
    { name: "Wire Nails 1 inch (per kg)", category: "Fasteners", unit: "Kg", price: 180, costPrice: 140 },
    { name: "Wire Nails 2 inch (per kg)", category: "Fasteners", unit: "Kg", price: 180, costPrice: 140 },
    { name: "Wire Nails 3 inch (per kg)", category: "Fasteners", unit: "Kg", price: 180, costPrice: 140 },
    { name: "Wire Nails 4 inch (per kg)", category: "Fasteners", unit: "Kg", price: 180, costPrice: 140 },
    { name: "Wall Putty (25kg)", category: "Other", unit: "Piece", price: 1450, costPrice: 1150 },
    { name: "Lime (25kg)", category: "Other", unit: "Piece", price: 550, costPrice: 420 },
    { name: "Waterproofing Cement (1kg)", category: "Other", unit: "Piece", price: 350, costPrice: 280 },
];

export async function GET() {
    try {
        const results = [];

        for (const item of HARDWARE_MATRIX) {
            const existing = await prisma.product.findFirst({
                where: { name: item.name }
            });

            if (!existing) {
                const sku = `HW-${item.category.slice(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                await prisma.product.create({
                    data: {
                        ...item,
                        sku: sku,
                        stock: 0,
                        minStock: 10
                    }
                });
                results.push(item);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Populated ${results.length} hardware items into the matrix.`,
            count: results.length
        });
    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
