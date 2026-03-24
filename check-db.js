const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_HSty95nUzWQZ@ep-twilight-heart-ampkhi6w-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        }
    }
});

async function check() {
    try {
        const staffCount = await prisma.staff.count();
        console.log("Total Staff Count:", staffCount);
        const admin = await prisma.staff.findUnique({ where: { username: "admin" } });
        console.log("Admin User Found:", !!admin);
        if (admin) {
            console.log("Admin Role:", admin.role);
            console.log("Admin Status:", admin.status);
        }
    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
