import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const transactionSchema = z.object({
    contractorId: z.string(),
    amount: z.number().positive(),
    type: z.enum(["Credit", "Payment"]),
    reference: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { contractorId, amount, type, reference } = transactionSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the transaction
            const transaction = await tx.contractorTransaction.create({
                data: {
                    contractorId,
                    amount,
                    type,
                    reference
                }
            });

            // 2. Update contractor balance
            // If Payment, decrease balance. If Credit, increase balance.
            const balanceChange = type === "Payment" ? -amount : amount;

            const updatedContractor = await tx.contractor.update({
                where: { id: contractorId },
                data: {
                    balance: { increment: balanceChange }
                },
                include: { transactions: true }
            });

            return { transaction, updatedContractor };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        console.error("DEBUG: POST Contractor Transaction Error:", error);
        return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
    }
}
