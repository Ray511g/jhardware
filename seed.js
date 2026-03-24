require('dotenv').config();
const { PrismaClient } = require("./src/generated/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_HSty95nUzWQZ@ep-twilight-heart-ampkhi6w-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        }
    }
});

const HARDWARE_ITEMS = [
    // Construction Essentials
    { name: "Blue Triangle Cement (50kg)", category: "Cement", price: 850, costPrice: 780, unit: "bag", minStock: 20 },
    { name: "Rhino Cement (50kg)", category: "Cement", price: 830, costPrice: 760, unit: "bag", minStock: 20 },
    { name: "Simba Cement (50kg)", category: "Cement", price: 840, costPrice: 770, unit: "bag", minStock: 20 },
    { name: "Mombasa Cement (50kg)", category: "Cement", price: 820, costPrice: 750, unit: "bag", minStock: 20 },
    { name: "River Sand (Tonne)", category: "Aggregate", price: 2500, costPrice: 1800, unit: "tonne", minStock: 5 },
    { name: "Ballast (Tonne)", category: "Aggregate", price: 2800, costPrice: 2000, unit: "tonne", minStock: 5 },
    { name: "Hardcore (Tonne)", category: "Aggregate", price: 1500, costPrice: 1200, unit: "tonne", minStock: 5 },

    // Steel & Reinforcement
    { name: "D12 Deformed Bar (High Yield)", category: "Steel", price: 1450, costPrice: 1300, unit: "pcs", minStock: 50 },
    { name: "D10 Deformed Bar (High Yield)", category: "Steel", price: 1050, costPrice: 950, unit: "pcs", minStock: 50 },
    { name: "D8 Deformed Bar (High Yield)", category: "Steel", price: 750, costPrice: 650, unit: "pcs", minStock: 50 },
    { name: "R6 Mild Steel Round Bar", category: "Steel", price: 450, costPrice: 380, unit: "pcs", minStock: 50 },
    { name: "Binding Wire (25kg)", category: "Steel", price: 4200, costPrice: 3800, unit: "roll", minStock: 5 },
    { name: "BRC Mesh (A142)", category: "Steel", price: 12500, costPrice: 11000, unit: "roll", minStock: 2 },

    // Roofing & Timber
    { name: "GCI Sheet Gauge 30 (3m)", category: "Roofing", price: 1200, costPrice: 1050, unit: "pcs", minStock: 30 },
    { name: "GCI Sheet Gauge 28 (3m)", category: "Roofing", price: 1600, costPrice: 1450, unit: "pcs", minStock: 20 },
    { name: "Versatile Iron Sheets (Box Profile)", category: "Roofing", price: 1850, costPrice: 1650, unit: "pcs", minStock: 15 },
    { name: "Timber 2x2 Cypress (per foot)", category: "Timber", price: 45, costPrice: 35, unit: "ft", minStock: 100 },
    { name: "Timber 3x2 Cypress (per foot)", category: "Timber", price: 65, costPrice: 55, unit: "ft", minStock: 100 },
    { name: "Timber 4x2 Cypress (per foot)", category: "Timber", price: 85, costPrice: 70, unit: "ft", minStock: 100 },
    { name: "Softboard (8x4)", category: "Boards", price: 1400, costPrice: 1200, unit: "pcs", minStock: 10 },
    { name: "Plywood 3mm (8x4)", category: "Boards", price: 1200, costPrice: 1000, unit: "pcs", minStock: 10 },

    // Plumbing & Water
    { name: "PPR Pipe 20mm (PN20)", category: "Plumbing", price: 450, costPrice: 380, unit: "pcs", minStock: 20 },
    { name: "PPR Pipe 25mm (PN20)", category: "Plumbing", price: 650, costPrice: 550, unit: "pcs", minStock: 20 },
    { name: "PVC Pipe 4-inch (Heavy Duty)", category: "Plumbing", price: 1850, costPrice: 1600, unit: "pcs", minStock: 10 },
    { name: "PVC Pipe 1.5-inch (Waste)", category: "Plumbing", price: 850, costPrice: 700, unit: "pcs", minStock: 10 },
    { name: "Gate Valve 1/2 inch (Pegler)", category: "Plumbing", price: 850, costPrice: 700, unit: "pcs", minStock: 10 },
    { name: "Kitchen Sink (Double Bowl)", category: "Plumbing", price: 6500, costPrice: 5500, unit: "pcs", minStock: 2 },
    { name: "Water Tank (1000L - Kentainers)", category: "Storage", price: 9500, costPrice: 8200, unit: "pcs", minStock: 2 },

    // Electrical
    { name: "1.5mm Twin & Earth Cable (90m)", category: "Electrical", price: 4500, costPrice: 4000, unit: "roll", minStock: 3 },
    { name: "2.5mm Twin & Earth Cable (90m)", category: "Electrical", price: 6800, costPrice: 6200, unit: "roll", minStock: 3 },
    { name: "One Gang Switch (ABB)", category: "Electrical", price: 250, costPrice: 180, unit: "pcs", minStock: 20 },
    { name: "Circuit Breaker 20A (Double)", category: "Electrical", price: 1200, costPrice: 950, unit: "pcs", minStock: 5 },
    { name: "Pendant Lampholder", category: "Electrical", price: 85, costPrice: 60, unit: "pcs", minStock: 50 },

    // Tools & Hardware
    { name: "Wheelbarrow (Heavy Duty - Kasuku)", category: "Tools", price: 5500, costPrice: 4800, unit: "pcs", minStock: 5 },
    { name: "Spade (Crocodile Brand)", category: "Tools", price: 850, costPrice: 650, unit: "pcs", minStock: 10 },
    { name: "Sledge Hammer (4kg)", category: "Tools", price: 2500, costPrice: 2100, unit: "pcs", minStock: 3 },
    { name: "Hand Saw (Stanley)", category: "Tools", price: 1500, costPrice: 1200, unit: "pcs", minStock: 5 },
    { name: "Concrete Nails 4-inch (1kg)", category: "Hardware", price: 350, costPrice: 280, unit: "pkt", minStock: 10 },
    { name: "Wood Nails 3-inch (1kg)", category: "Hardware", price: 220, costPrice: 180, unit: "pkt", minStock: 10 },

    // Paints & Finishes
    { name: "Crown Vinyl Matt White (20L)", category: "Paint", price: 9500, costPrice: 8800, unit: "tin", minStock: 5 },
    { name: "Crown Gloss White (4L)", category: "Paint", price: 3200, costPrice: 2800, unit: "tin", minStock: 10 },
    { name: "Undercoat White (20L)", category: "Paint", price: 6500, costPrice: 5800, unit: "tin", minStock: 5 },
    { name: "Paint Brush 4-inch", category: "Tools", price: 250, costPrice: 180, unit: "pcs", minStock: 20 },
    { name: "Turpentine (5L)", category: "Solvent", price: 1200, costPrice: 950, unit: "tin", minStock: 5 }
];

async function main() {
    console.log("🚀 Initializing Biashara POS Seed Engine...");

    try {
        // 1. Seed Staff
        const adminPassword = "admin123";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await prisma.staff.upsert({
            where: { username: "admin" },
            update: { password: hashedPassword, role: "Admin", status: "Active" },
            create: {
                name: "System Administrator",
                username: "admin",
                password: hashedPassword,
                role: "Admin",
                permissions: JSON.stringify(["pos_access", "inventory_manage", "reports_view", "staff_control", "settings_edit"]),
                status: "Active",
            },
        });

        // 2. Seed Hardware Catalog (Auto-populate)
        console.log("📦 Populating Kenyan Hardware Catalog...");
        let count = 0;
        for (const item of HARDWARE_ITEMS) {
            const existing = await prisma.product.findFirst({
                where: { name: item.name }
            });

            if (!existing) {
                const prefix = item.category.slice(0, 3).toUpperCase();
                const random = Math.random().toString(36).substring(2, 7).toUpperCase();
                const sku = `HW-${prefix}-${random}`;

                await prisma.product.create({
                    data: {
                        ...item,
                        sku,
                        stock: 0
                    }
                });
                count++;
            }
        }

        console.log(`✨ Seeding completed. ${count} products added to matrix at zero stock.`);
    } catch (err) {
        console.error("❌ Database Operation Failed:", err);
        throw err;
    }
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
