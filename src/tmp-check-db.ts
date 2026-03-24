import { PrismaClient } from './generated/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Checking Product table...")
        const productCount = await prisma.product.count()
        console.log("Product count:", productCount)

        console.log("Checking Expense table...")
        const expenseCount = await prisma.expense.count()
        console.log("Expense count:", expenseCount)

        console.log("Check successful")
    } catch (error) {
        console.error("DB Error:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
