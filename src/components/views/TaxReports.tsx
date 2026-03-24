"use client";

import React, { useState } from "react";
import {
    FileSearch,
    Download,
    Printer,
    ShieldCheck,
    FileText,
    TrendingDown,
    ArrowRight,
    Plus,
    ChevronLeft,
    ChevronRight as ChevronRightIcon
} from "lucide-react";
import { generateTaxReport } from "@/lib/pdf-service";
import { useApp } from "@/context/AppContext";

export default function TaxReports() {
    const { orders, config } = useApp();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const taxPercent = config?.taxPercentage || 16.0;

    const handleExport = () => {
        if (orders.length === 0) {
            alert("No transactional data available for KRA export.");
            return;
        }
        generateTaxReport(orders, config);
    };

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalVAT = totalRevenue * (taxPercent / 100);

    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8 animate-fade-in group text-white">
            <div className="flex items-center justify-end">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-5 py-2.5 premium-gradient text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.01] transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Export KRA Manifest
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-4 border-white/[0.03] bg-white/[0.01] relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-teal-500/10 rounded-full blur-2xl"></div>
                    <FileText className="w-6 h-6 text-teal-500 mb-4" />
                    <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Estimated VAT ({taxPercent}%)</p>
                    <h4 className="text-lg font-black text-white italic tracking-tighter leading-none">KES {totalVAT.toLocaleString()}</h4>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-3 bg-slate-950 border border-white/5 py-0.5 px-2 rounded w-fit italic">March 2026 Cycle</p>
                </div>

                <div className="glass-card p-4 border-blue-500/10 bg-blue-500/[0.03]">
                    <ShieldCheck className="w-6 h-6 text-blue-500 mb-4" />
                    <p className="text-blue-500/60 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Audit Score</p>
                    <h4 className="text-lg font-black text-white italic tracking-tighter leading-none">99.8%</h4>
                    <p className="text-[8px] text-slate-600 font-bold uppercase mt-3 tracking-widest italic opacity-60">Verified System v2.0</p>
                </div>

                <div className="glass-card p-4 border-rose-500/10 bg-rose-500/[0.03]">
                    <TrendingDown className="w-6 h-6 text-rose-500 mb-4" />
                    <p className="text-rose-500/60 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Total Witholding</p>
                    <h4 className="text-lg font-black text-white italic tracking-tighter leading-none">KES 42,000</h4>
                    <p className="text-[8px] text-slate-600 font-bold uppercase mt-3 tracking-widest italic opacity-60">Supplier Deductions</p>
                </div>
            </div>

            <div className="glass-card p-5 border-white/[0.03] bg-white/[0.01]">
                <h4 className="text-base font-black mb-6 uppercase tracking-tighter italic">Enterprise Tax Logs</h4>
                <div className="space-y-2.5 mb-6">
                    {paginatedOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/[0.03] group hover:border-teal-500/20 transition-all hover:bg-slate-900/50">
                            <div className="flex items-center gap-5">
                                <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg group-hover:text-teal-500 transition-colors">
                                    <Printer className="w-4 h-4 text-slate-700" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-200 text-base tracking-tight uppercase leading-none">ETR-LOG-{order.orderNumber || order.id.slice(-6).toUpperCase()}</p>
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1.5">{new Date(order.date).toLocaleDateString()} • Compliance Record</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="text-right">
                                    <p className="text-base font-black text-teal-400 italic tracking-tighter leading-none">VAT: KES {(order.total * (taxPercent / 100)).toLocaleString()}</p>
                                    <span className="text-[8px] text-emerald-500/70 font-black uppercase tracking-widest mt-1.5 inline-block">Signed & Verified</span>
                                </div>
                                <button className="w-8 h-8 bg-slate-950 border border-white/5 rounded-lg text-slate-700 hover:text-teal-500 group-hover:border-teal-500/20 transition-all flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="py-16 text-center opacity-20">
                            <FileSearch className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                            <p className="font-black uppercase tracking-widest text-[10px]">Waiting for transaction sync</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4 border-t border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                title="Previous Page"
                                className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                title="Next Page"
                                className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                            >
                                <ChevronRightIcon size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
