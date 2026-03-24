"use client";

import React, { useState } from "react";
import {
    Calendar,
    ChevronDown,
    Download,
    FileText,
    TrendingUp,
    Package,
    Users,
    DollarSign,
    Clock,
    BarChart3,
    Search,
    RefreshCw,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { 
    generateLedgerReport, 
    generateInventoryReport, 
    generatePOListReport, 
    generateFinancialReport, 
    generateVendorReport, 
    generateContractorAgingReport 
} from "@/lib/pdf-service";
import ReportPreviewModal from "@/components/modals/ReportPreviewModal";

interface ReportCardProps {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
    isLoading?: boolean;
}

const ReportCard = ({ title, description, icon: Icon, onClick, isLoading }: ReportCardProps) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-start gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
            <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
            <p className="text-[12px] text-slate-500 leading-tight">{description}</p>
        </div>
        <button
            onClick={onClick}
            disabled={isLoading}
            className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate Report
        </button>
    </div>
);

export default function ReportIntelligence() {
    const { config } = useApp();
    const [filters, setFilters] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        quickSelect: "Custom Range"
    });
    const [generating, setGenerating] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ isOpen: boolean; url: string | null; title: string }>({
        isOpen: false,
        url: null,
        title: ""
    });

    const handleQuickSelect = (val: string) => {
        const now = new Date();
        let from = new Date();
        let to = new Date();

        switch (val) {
            case "This Month":
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "Last Month":
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                to = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case "This Year":
                from = new Date(now.getFullYear(), 0, 1);
                break;
        }

        setFilters({
            ...filters,
            quickSelect: val,
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0]
        });
    };

    const handleGenerate = async (type: string, title: string) => {
        setGenerating(type);
        try {
            const res = await fetch(`/api/reports?type=${type}&from=${filters.from}&to=${filters.to}`);
            const data = await res.json();
            
            let url = null;
            switch(type) {
                case "sales": url = await generateLedgerReport(data, config); break;
                case "inventory": url = await generateInventoryReport(data, config); break;
                case "po": url = await generatePOListReport(data, config); break;
                case "finance": url = await generateFinancialReport(data, config); break;
                case "vendors": url = await generateVendorReport(data, config); break;
                case "aging": url = await generateContractorAgingReport(data, config); break;
            }

            if (url) {
                setPreview({ isOpen: true, url: url.toString(), title });
            }
        } catch (error) {
            console.error("Report generation failed:", error);
            alert("Failed to generate report. Please check console.");
        } finally {
            setGenerating(null);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 p-6 animate-fade-in text-slate-800">
            {/* Filter Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold mb-6 text-slate-900">Report Period</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-500">From Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                                value={filters.from}
                                onChange={e => setFilters({ ...filters, from: e.target.value, quickSelect: "Custom Range" })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-500">To Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                                value={filters.to}
                                onChange={e => setFilters({ ...filters, to: e.target.value, quickSelect: "Custom Range" })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-500">Quick Select</label>
                        <div className="relative">
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                                value={filters.quickSelect}
                                onChange={e => handleQuickSelect(e.target.value)}
                            >
                                <option>Custom Range</option>
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>This Year</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 ml-2">Available Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard 
                        title="Sales Summary Report"
                        description="Detailed sales transactions and revenue analysis"
                        icon={TrendingUp}
                        isLoading={generating === "sales"}
                        onClick={() => handleGenerate("sales", "Sales Summary Report")}
                    />
                    <ReportCard 
                        title="Inventory Audit Report"
                        description="Stock levels, movements, and valuation"
                        icon={Package}
                        isLoading={generating === "inventory"}
                        onClick={() => handleGenerate("inventory", "Inventory Audit Report")}
                    />
                    <ReportCard 
                        title="Purchase Order Report"
                        description="All purchase orders and supplier transactions"
                        icon={FileText}
                        isLoading={generating === "po"}
                        onClick={() => handleGenerate("po", "Purchase Order Report")}
                    />
                    <ReportCard 
                        title="Financial Statement"
                        description="Profit & loss, balance sheet, cash flow"
                        icon={DollarSign}
                        isLoading={generating === "finance"}
                        onClick={() => handleGenerate("finance", "Financial Statement")}
                    />
                    <ReportCard 
                        title="Vendor Performance"
                        description="Vendor analysis and procurement metrics"
                        icon={Users}
                        isLoading={generating === "vendors"}
                        onClick={() => handleGenerate("vendors", "Vendor Performance Report")}
                    />
                    <ReportCard 
                        title="Contractors Aging Analysis"
                        description="Individual contractor debt and payment patterns"
                        icon={Clock}
                        isLoading={generating === "aging"}
                        onClick={() => handleGenerate("aging", "Contractors Aging Analysis")}
                    />
                </div>
            </div>

            <ReportPreviewModal 
                isOpen={preview.isOpen}
                onClose={() => setPreview({ ...preview, isOpen: false })}
                pdfUrl={preview.url}
                title={preview.title}
            />
        </div>
    );
}
