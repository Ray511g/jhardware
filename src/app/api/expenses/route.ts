import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth-utils";
import { recordAudit } from "@/lib/audit";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "expenses_view")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!hasPermission(user, "expenses_manage")) {
            return NextResponse.json({ error: "Insufficient Protocol Clearance" }, { status: 403 });
        }

        const body = await req.json();

        if (!body.reason || body.amount === undefined || !body.category) {
            return NextResponse.json({ error: "Missing required fields: reason, amount, and category are mandatory" }, { status: 400 });
        }

        const amount = parseFloat(body.amount);
        if (isNaN(amount)) {
            return NextResponse.json({ error: "Invalid amount format" }, { status: 400 });
        }

        const expense = await prisma.expense.create({
            data: {
                reason: body.reason,
                amount: amount,
                category: body.category,
                date: body.date ? new Date(body.date) : new Date()
            }
        });

        await recordAudit(
            user!.id,
            user!.name,
            "CREATE",
            "Expenses",
            `Logged operational drainage: ${expense.reason}. Amount: KES ${expense.amount}`
        );

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error("DEBUG: POST Expense Error Details:", error);
        return NextResponse.json({ error: "Failed to log expense" }, { status: 500 });
    }
}
