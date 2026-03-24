const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Enterprise Data...");

    // Products
    const products = [
        { sku: "CEM-PR-01", name: "Bamburi Cement 50kg (Prestige)", category: "Masonry", stock: 250, minStock: 50, price: 980, costPrice: 850, unit: "Bag" },
        { sku: "ST-D12-12", name: "D12 Deformed Bars (12m)", category: "Steel", stock: 80, minStock: 200, price: 1450, costPrice: 1200, unit: "Piece" },
        { sku: "ST-D10-12", name: "D10 Deformed Bars (12m)", category: "Steel", stock: 120, minStock: 150, price: 1150, costPrice: 950, unit: "Piece" },
        { sku: "PL-PVC-25", name: "PVC Pipe 25mm (Imperial)", category: "Plumbing", stock: 45, minStock: 100, price: 420, costPrice: 310, unit: "Piece" },
        { sku: "PA-GL-WH", name: "Crown White Gloss (4L)", category: "Paint", stock: 12, minStock: 20, price: 2850, costPrice: 2200, unit: "Can" },
        { sku: "HW-NL-3", name: "Wire Nails 3-inch", category: "Hardware", stock: 300, minStock: 50, price: 180, costPrice: 145, unit: "Kg" },
        { sku: "HW-NL-4", name: "Wire Nails 4-inch", category: "Hardware", stock: 210, minStock: 50, price: 190, costPrice: 155, unit: "Kg" },
        { sku: "EL-CB-25", name: "Single Core Cable 2.5mm", category: "Electrical", stock: 15, minStock: 10, price: 6500, costPrice: 5200, unit: "Roll" },
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: p,
            create: p,
        });
    }

    // Vendors
    const vendors = [
        { name: "Bamburi Cement Ltd", type: "Manufacturer", contact: "+254 711 000 000", email: "sales@bamburi.com", address: "Mombasa Road", rating: 4.8 },
        { name: "Apex Steel Ltd", type: "Manufacturer", contact: "+254 722 000 000", email: "orders@apex.com", address: "Athi River", rating: 4.5 },
    ];

    for (const v of vendors) {
        await prisma.vendor.create({ data: v });
    }

    // Contractors
    const contractors = [
        { name: "Elite Construction Ltd", phone: "0711122233", balance: 450000 },
        { name: "Skyline Developers", phone: "0788776655", balance: 120000 },
    ];

    for (const c of contractors) {
        await prisma.contractor.create({ data: c });
    }

    console.log("Enterprise Data Seeded Successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
