import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.mpesaPayment.count();
    const latest = await prisma.mpesaPayment.findMany({
        take: 5,
        orderBy: { transactedAt: 'desc' }
    });

    console.log(`Total M-Pesa Payments: ${count}`);
    console.log("Latest 5 payments:");
    console.table(latest);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
