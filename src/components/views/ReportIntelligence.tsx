"use client";

import React, { useState, useMemo } from "react";
import {
    FileSearch,
    ChevronRight,
    ChevronDown,
    Calendar,
    Filter,
    Download,
    Eye,
    BarChart3,
    Package,
    Users,
    CreditCard,
    ShieldCheck,
    TrendingUp,
    Search,
    DownloadCloud,
    FileText,
    PieChart,
    AlertCircle,
    Lock
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    generateTaxReport,
    generateInventoryReport,
    generateLedgerReport,
    generateVendorReport,
    generateContractorReport,
    generatePaymentPatternsReport,
    generateContractorStatementReport,
    generatePOListReport
} from "@/lib/pdf-service";
import ReportPreviewModal from "@/components/modals/ReportPreviewModal";
import { downloadCSV } from "@/lib/export-utils";

type ReportType = {
    id: string;
    label: string;
    icon: any;
    filters: string[];
};

type Category = {
    id: string;
    label: string;
    icon: any;
    reports: ReportType[];
};

const reportHierarchy: Category[] = [
    {
        id: "finance",
        label: "Revenue Intelligence",
        icon: TrendingUp,
        reports: [
            { id: "daily-ledger", label: "Daily Transactional Ledger", icon: FileSearch, filters: ["date", "staff"] },
            { id: "monthly-audit", label: "Monthly Performance Audit", icon: BarChart3, filters: ["month"] },
            { id: "payment-channels", label: "Payment Channel Breakdown", icon: PieChart, filters: ["dateRange"] },
        ]
    },
    {
        id: "inventory",
        label: "Inventory Analytics",
        icon: Package,
        reports: [
            { id: "stock-valuation", label: "Live Stock Valuation Audit", icon: FileText, filters: ["category"] },
            { id: "shortage-risk", label: "Critical Shortage Analysis", icon: AlertCircle, filters: ["level"] },
            { id: "movement-history", label: "Product Velocity report", icon: BarChart3, filters: ["product", "dateRange"] },
        ]
    },
    {
        id: "procurement",
        label: "Supply Chain Audit",
        icon: DownloadCloud,
        reports: [
            { id: "vendor-liability", label: "Vendor Liability Statement", icon: Users, filters: ["vendor"] },
            { id: "po-delivery", label: "PO Delivery Audit", icon: FileSearch, filters: ["status", "dateRange"] },
            { id: "po-ledger", label: "PO Global Ledger", icon: FileText, filters: ["dateRange"] },
        ]
    },
    {
        id: "contractors",
        label: "Credit & Debt",
        icon: CreditCard,
        reports: [
            { id: "debt-aging", label: "Contractor Debt Aging", icon: AlertCircle, filters: ["contractor"] },
            { id: "payment-patterns", label: "Contractor Payment Patterns", icon: BarChart3, filters: ["dateRange"] },
            { id: "contractor-statement", label: "Contractor Statement", icon: FileText, filters: ["contractor", "dateRange"] },
        ]
    },
    {
        id: "fiscal",
        label: "Fiscal Compliance",
        icon: ShieldCheck,
        reports: [
            { id: "vat-summary", label: "VAT Liability Summary", icon: ShieldCheck, filters: ["month"] },
            { id: "tax-export", label: "KRA PIN-Aligned Export", icon: Download, filters: ["dateRange"] },
        ]
    }
];

export default function ReportIntelligence() {
    const { orders, products, vendors, contractors, config, expenses, pos } = useApp();
    const { user } = useAuth();
    const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
    const [expandedCats, setExpandedCats] = useState<string[]>(["finance"]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        category: "All",
        vendor: "All",
        contractor: "All",
        staff: "All",
        month: new Date().toISOString().slice(0, 7)
    });

    // Strict Clearance Protocol
    const canView = user?.role === "Admin" || user?.permissions?.includes("reports_view");

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks clearance for Intelligence Reports.</p>
            </div>
        );
    }

    const prepareData = () => {
        if (!selectedReport) return [];
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);

        if (selectedReport.id === "daily-ledger" ||
            selectedReport.id === "monthly-audit" ||
            selectedReport.id === "vat-summary" ||
            selectedReport.id === "tax-export" ||
            selectedReport.id === "payment-channels") {
            return orders.filter(o => {
                const d = new Date(o.date);
                return d >= start && d <= end;
            });
        }

        if (selectedReport.id === "stock-valuation" || selectedReport.id === "shortage-risk") {
            if (selectedReport.id === "shortage-risk") {
                return products.filter(p => (p.stock || 0) <= (p.minStock || 5));
            }
            return products;
        }

        if (selectedReport.id === "movement-history") {
            const movements = orders.flatMap(o =>
                (o.items || []).map(item => ({
                    ...item,
                    date: o.date,
                    orderNumber: o.orderNumber
                }))
            ).filter(m => {
                const d = new Date(m.date);
                return d >= start && d <= end;
            });
            return movements;
        }

        if (selectedReport.id === "vendor-liability") return vendors;
        if (selectedReport.id === "po-delivery" || selectedReport.id === "po-ledger") {
            return pos.filter(po => {
                const d = new Date(po.date);
                return d >= start && d <= end;
            }).map(po => ({
                ...po,
                vendorName: vendors.find(v => v.id === po.vendorId)?.name || "External"
            }));
        }

        if (selectedReport.id === "debt-aging") return contractors;

        if (selectedReport.id === "payment-patterns") {
            const allTransactions = contractors.flatMap(c =>
                (c.transactions || []).map(t => ({ ...t, contractorName: c.name }))
            ).filter(t => t.type === "Payment");

            return allTransactions.filter(t => {
                const d = new Date(t.date);
                return d >= start && d <= end;
            });
        }

        if (selectedReport.id === "contractor-statement") {
            const targetContractor = contractors.find(c => c.id === filters.contractor);
            if (!targetContractor && filters.contractor !== "All") return [];

            return {
                contractor: targetContractor,
                orders: orders.filter((o: any) =>
                    o.paymentMethod === "Credit" &&
                    (filters.contractor === "All" || o.contractorId === filters.contractor) &&
                    new Date(o.date) >= start && new Date(o.date) <= end
                ),
                transactions: contractors.flatMap(c =>
                    (c.transactions || []).map(t => ({ ...t, contractorName: c.name, contractorId: c.id }))
                ).filter(t =>
                    (filters.contractor === "All" || t.contractorId === filters.contractor) &&
                    new Date(t.date) >= start && new Date(t.date) <= end
                )
            };
        }

        return [];
    };

    const handlePreview = () => {
        if (!selectedReport) return;
        const data = prepareData() as any;
        let url: any;

        switch (selectedReport.id) {
            case "stock-valuation":
                url = generateInventoryReport(data, config);
                break;
            case "daily-ledger":
                url = generateLedgerReport(data, config);
                break;
            case "vendor-liability":
                url = generateVendorReport(data, config);
                break;
            case "debt-aging":
                url = generateContractorReport(data, config);
                break;
            case "payment-patterns":
                url = generatePaymentPatternsReport(data, config);
                break;
            case "contractor-statement":
                url = generateContractorStatementReport(data, config, filters);
                break;
            case "po-ledger":
                url = generatePOListReport(data, config);
                break;
            default:
                url = generateTaxReport(data, config);
        }

        setPreviewUrl(url);
        setIsPreviewOpen(true);
    };

    const handleDownload = (format: "pdf" | "csv") => {
        if (!selectedReport) return;
        const data = prepareData() as any;

        if (format === "pdf") {
            let url: any;
            switch (selectedReport.id) {
                case "stock-valuation":
                    url = generateInventoryReport(data, config);
                    break;
                case "daily-ledger":
                    url = generateLedgerReport(data, config);
                    break;
                case "vendor-liability":
                    url = generateVendorReport(data, config);
                    break;
                case "debt-aging":
                    url = generateContractorReport(data, config);
                    break;
                case "payment-patterns":
                    url = generatePaymentPatternsReport(data, config);
                    break;
                case "contractor-statement":
                    url = generateContractorStatementReport(data, config, filters);
                    break;
                case "po-ledger":
                    url = generatePOListReport(data, config);
                    break;
                default:
                    url = generateTaxReport(data, config);
            }
            const link = document.createElement("a");
            link.href = url;
            link.download = `${selectedReport.label.replace(/\s+/g, "_")}.pdf`;
            link.click();
        } else {
            const csvData = (Array.isArray(data) ? data : []).map((item: any) => ({
                ID: item.orderNumber || item.id,
                Date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
                Name: item.name || 'N/A',
                Total: item.total || 0,
                Method: item.paymentMethod || 'N/A'
            }));
            downloadCSV(csvData, selectedReport.label.replace(/\s+/g, "_"));
        }
        setShowDownloadOptions(false);
    };

    const toggleCat = (id: string) => {
        setExpandedCats(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in relative z-10 text-white">
            <div className="lg:col-span-1 space-y-4">
                <div className="glass-card p-6 border-white/[0.03] bg-white/[0.01]">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <FileSearch className="w-5 h-5 text-teal-500" />
                        Report Directory
                    </h3>

                    <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                        {reportHierarchy.map((cat) => (
                            <div key={cat.id} className="space-y-2">
                                <button
                                    onClick={() => toggleCat(cat.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-900/50 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <cat.icon className="w-4 h-4 text-slate-500 group-hover:text-teal-500 transition-colors" />
                                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white tracking-widest">{cat.label}</span>
                                    </div>
                                    {expandedCats.includes(cat.id) ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                                </button>

                                <AnimatePresence>
                                    {expandedCats.includes(cat.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-1 pl-4"
                                        >
                                            {cat.reports.map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => setSelectedReport(report)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedReport?.id === report.id
                                                        ? "bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)]"
                                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                                        }`}
                                                >
                                                    <report.icon className={`w-3.5 h-3.5 ${selectedReport?.id === report.id ? "text-teal-500" : "opacity-50"}`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{report.label}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
                {selectedReport ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="glass-card p-8 border-white/[0.03] bg-white/[0.01]">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                                        <selectedReport.icon className="w-6 h-6 text-teal-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{selectedReport.label}</h2>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Configuring report parameters...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handlePreview}
                                        className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                                            className="flex items-center gap-3 px-8 py-3 premium-gradient text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <Download className="w-4 h-4" />
                                            Generate Report
                                        </button>

                                        <AnimatePresence>
                                            {showDownloadOptions && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => handleDownload("pdf")}
                                                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 text-[10px] font-black uppercase text-slate-300 transition-all"
                                                    >
                                                        <FileText className="w-4 h-4 text-rose-500" />
                                                        Portable Document (PDF)
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload("csv")}
                                                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 text-[10px] font-black uppercase text-slate-300 transition-all border-t border-white/5"
                                                    >
                                                        <PieChart className="w-4 h-4 text-teal-500" />
                                                        Data Sheet (CSV)
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {selectedReport.filters.includes("dateRange") && (
                                    <>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-teal-500" /> Start Date
                                            </label>
                                            <div className="relative group/date">
                                                <input
                                                    type="date"
                                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all [color-scheme:dark]"
                                                    value={filters.startDate}
                                                    onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                                                />
                                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500/50 pointer-events-none group-focus-within/date:text-teal-500 transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-teal-500" /> End Date
                                            </label>
                                            <div className="relative group/date">
                                                <input
                                                    type="date"
                                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all [color-scheme:dark]"
                                                    value={filters.endDate}
                                                    onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                                                />
                                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500/50 pointer-events-none group-focus-within/date:text-teal-500 transition-colors" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedReport.filters.includes("category") && (
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                            <Filter className="w-3 h-3 text-teal-500" /> Report Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                title="Report Category Selection"
                                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all appearance-none"
                                                value={filters.category}
                                                onChange={e => setFilters({ ...filters, category: e.target.value })}
                                            >
                                                <option>All Segments</option>
                                                <option>Retail Channel</option>
                                                <option>WholeSale Dept</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {selectedReport.filters.includes("contractor") && (
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                            <Users className="w-3 h-3 text-teal-500" /> Select Contractor
                                        </label>
                                        <div className="relative">
                                            <select
                                                title="Contractor Selection"
                                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all appearance-none"
                                                value={filters.contractor}
                                                onChange={e => setFilters({ ...filters, contractor: e.target.value })}
                                            >
                                                <option value="All">All Contractors</option>
                                                {contractors.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-[40vh] border border-dashed border-white/5 bg-white/[0.005] rounded-3xl flex flex-col items-center justify-center text-center p-12">
                            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5 opacity-30">
                                <BarChart3 className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 max-w-xs leading-loose">
                                Report parameters active. Use the actions above to preview or generate the formal document.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[70vh] flex flex-col items-center justify-center text-center glass-card border-dashed border-white/5 space-y-8 p-20 animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-500/20 blur-[100px] animate-pulse"></div>
                            <BarChart3 className="w-24 h-24 text-teal-800 relative z-10" />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase underline decoration-teal-500/30 decoration-4 underline-offset-8">Reports <span className="text-teal-500">Center</span></h2>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] max-w-md mx-auto leading-loose">
                                Select a report from the menu to begin data analysis and document generation.
                            </p>
                        </div>
                        <div className="w-full max-w-xs h-1 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-teal-500/30"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <ReportPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                pdfUrl={previewUrl}
                title={selectedReport?.label || "Intelligence Report"}
            />
        </div>
    );
}
