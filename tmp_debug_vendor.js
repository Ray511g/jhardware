import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- DEBUG DATA FOR VENDOR 'Rayzz' ---");
    const vendor = await prisma.vendor.findFirst({
        where: { name: { contains: 'Rayzz', mode: 'insensitive' } },
        include: {
            pos: {
                include: {
                    transactions: true
                }
            },
            transactions: true
        }
    });

    if (!vendor) {
        console.log("Vendor 'Rayzz' not found.");
        return;
    }

    console.log(`Vendor ID: ${vendor.id}`);
    console.log(`Vendor Name: ${vendor.name}`);
    console.log(`Current Balance: ${vendor.balance}`);
    console.log("\n--- PURCHASE ORDERS ---");
    vendor.pos.forEach(po => {
        console.log(`PO: ${po.poNumber} | Status: ${po.status} | Method: ${po.paymentMethod} | Total: ${po.total} | Paid: ${po.paidAmount}`);
        po.transactions.forEach(tx => {
            console.log(`  -> Transaction: ${tx.amount} | Method: ${tx.method} | Ref: ${tx.reference} | Date: ${tx.date}`);
        });
    });

    console.log("\n--- ALL VENDOR TRANSACTIONS ---");
    vendor.transactions.forEach(tx => {
        console.log(`TX: ${tx.amount} | Method: ${tx.method} | PO ID: ${tx.poId} | Date: ${tx.date}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
