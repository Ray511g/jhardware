import { NextResponse } from "next/server";
import { 
    getSalesSummary, 
    getInventoryAudit, 
    getPurchaseOrderReport, 
    getFinancialStatement, 
    getVendorPerformance, 
    getContractorAging 
} from "@/lib/report-service";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    const from = fromStr ? new Date(fromStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = toStr ? new Date(toStr) : new Date();

    try {
        let data;
        switch (type) {
            case "sales":
                data = await getSalesSummary(from, to);
                break;
            case "inventory":
                data = await getInventoryAudit();
                break;
            case "po":
                data = await getPurchaseOrderReport(from, to);
                break;
            case "finance":
                data = await getFinancialStatement(from, to);
                break;
            case "vendors":
                data = await getVendorPerformance();
                break;
            case "aging":
                data = await getContractorAging();
                break;
            default:
                return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[REPORT API ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
