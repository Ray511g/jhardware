import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Debug Env
const envKeys = Object.keys(process.env).filter(k => k.includes("DATABASE") || k.includes("URL"));
console.log("DEBUG: Relevant Env Vars:", envKeys.map(k => {
    const val = process.env[k];
    const masked = (val?.startsWith('postgresql') || val?.startsWith('postgres')) ? 'POSTGRES_URL_HIDDEN' : val;
    return `${k}=${masked}`;
}));

const dbUrl = process.env.DATABASE_URL;

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ["query", "error", "warn"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
