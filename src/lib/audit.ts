import { prisma } from "./prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "VOID" | "EXPORT" | "ACCESS_DENIED";
export type AuditModule = "Inventory" | "POS" | "Staff" | "Vendors" | "Contractors" | "Reports" | "Auth" | "Settings" | "Expenses";

export async function recordAudit(
    staffId: string,
    staffName: string,
    action: AuditAction,
    module: AuditModule,
    details?: string | object
) {
    try {
        await prisma.auditLog.create({
            data: {
                staffId,
                staffName,
                action,
                module,
                details: typeof details === 'object' ? JSON.stringify(details) : details,
            }
        });
    } catch (error) {
        console.error("CRITICAL: AUDIT_LOG_FAILURE:", error);
    }
}
