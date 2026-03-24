"use client";

import React, { useState } from "react";
import {
    ArrowDownToLine,
    Plus,
    Truck,
    Clock,
    CheckCircle,
    PackageSearch,
    ChevronRight,
    TrendingUp,
    Printer,
    FileText
} from "lucide-react";

import { useApp } from "@/context/AppContext";
import CreatePOModal from "../modals/CreatePOModal";
import PrintPOModal from "../modals/PrintPOModal";
import PODetailModal from "../modals/PODetailModal";
import { generatePOPDF, generateGRNReport } from "@/lib/pdf-service";

export default function StockInward() {
    const { pos, vendors, updatePO, products, config } = useApp();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(pos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPOs = pos.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8 animate-fade-in relative z-10">
            <CreatePOModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
            <PrintPOModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                po={selectedPO}
                vendor={selectedVendor}
                products={products}
            />
            {/* Compute current PO from global state to ensure instant reflection in analysis */}
            <PODetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                po={pos.find(p => p.id === selectedPO?.id) || selectedPO}
                vendor={vendors.find(v => v.id === (selectedPO?.vendorId || pos.find(p => p.id === selectedPO?.id)?.vendorId))}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Procurement <span className="text-teal-500">Hub</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                        <Truck className="w-3 h-3 text-teal-500" />
                        Supply Chain Supply Matrix
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2.5 px-6 py-3 premium-gradient text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-teal-500/10 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Manifest Entry
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: "Pending Manifests", value: pos.filter(p => p.status === 'Pending').length, icon: Clock, color: "from-amber-500/20 to-transparent", textColor: "text-amber-500", border: "border-amber-500/20" },
                    { label: "Successful Deliveries", value: pos.filter(p => p.status === 'Delivered').length, icon: CheckCircle, color: "from-emerald-500/20 to-transparent", textColor: "text-emerald-500", border: "border-emerald-500/20" },
                    { label: "Procure Capital", value: `Kshs ${(pos.reduce((sum, p) => sum + p.total, 0)).toLocaleString()}`, icon: TrendingUp, color: "from-teal-500/20 to-transparent", textColor: "text-teal-400", border: "border-teal-500/20" },
                ].map((stat, i) => (
                    <div key={i} className={`glass-card p-6 border ${stat.border} bg-gradient-to-br ${stat.color} backdrop-blur-md`}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                                <h4 className={`text-2xl font-black ${stat.textColor} tracking-tighter`}>{stat.value}</h4>
                            </div>
                            <div className={`p-2 rounded-lg bg-black/20 ${stat.textColor} border border-white/5`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card border-white/[0.03] bg-white/[0.01] overflow-hidden">
                <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                            <ArrowDownToLine className="w-5 h-5 text-teal-500" />
                            Global Supply Ledger
                        </h3>
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-1">Real-time procurement tracking</p>
                    </div>
                </div>

                <div className="divide-y divide-white/[0.02]">
                    {pos.length === 0 ? (
                        <div className="py-24 text-center">
                            <Truck className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">Matrix idle - No records found</p>
                        </div>
                    ) : paginatedPOs.map((po) => {
                        const vendor = vendors.find(v => v.id === po.vendorId);
                        const items = JSON.parse(po.items);
                        return (
                            <div key={po.id} className="group hover:bg-white/[0.01] transition-all p-5">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${po.status === 'Delivered' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse'
                                            }`}>
                                            <PackageSearch className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-white text-lg uppercase tracking-tighter leading-none">{po.poNumber}</p>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${po.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                                                    'bg-amber-500/20 text-amber-400 border border-amber-500/10'
                                                    }`}>
                                                    {po.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest underline decoration-white/10 underline-offset-4">{vendor?.name || 'External Core'}</p>
                                                <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{new Date(po.date).toLocaleDateString()} @ {new Date(po.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${po.paymentMethod === 'Cash' ? 'text-emerald-500' : 'text-amber-500/70'}`}>
                                                    {po.paymentMethod === 'Cash' ? 'Cash Settlement' : 'Credit Account'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:justify-end gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em] text-right">Transaction Volume</p>
                                            <div className="flex items-center gap-3 justify-end">
                                                <span className="text-slate-400 font-black text-sm tracking-tighter underline decoration-teal-500/20 underline-offset-4">{items.length} SKUs</span>
                                            </div>
                                        </div>

                                        <div className="text-right min-w-[120px]">
                                            <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">Transaction</p>
                                            <p className="text-xl font-black text-teal-400 italic tracking-tighter mt-1">Kshs {po.total.toLocaleString()}</p>
                                            {po.paymentMethod === 'Credit' && (
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">
                                                    Paid: <span className="text-white">Kshs {(po.paidAmount || 0).toLocaleString()}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {po.status === 'Pending' && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Confirm reception of Manifest ${po.poNumber}? Hardware matrix will be updated.`)) {
                                                            updatePO(po.id, { status: 'Delivered' });
                                                        }
                                                    }}
                                                    title="Confirm Reception"
                                                    className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:scale-105 transition-all"
                                                >
                                                    Reception
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedPO(po);
                                                    setSelectedVendor(vendor);
                                                    setIsPrintModalOpen(true);
                                                }}
                                                title="Manifest Dispatch Options"
                                                className="w-10 h-10 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center text-teal-500 hover:bg-teal-500/10 hover:border-teal-500/20 hover:scale-110 transition-all shadow-lg"
                                            >
                                                <Printer className="w-5 h-5" />
                                            </button>
                                            {po.status === 'Delivered' && (
                                                <button
                                                    onClick={() => generateGRNReport(po, vendor, products, 'download', config)}
                                                    title="Download GRN"
                                                    className="w-10 h-10 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:scale-110 transition-all shadow-lg"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedPO(po);
                                                    setSelectedVendor(vendor);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                title="View Manifest Details & Payments"
                                                className="w-10 h-10 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-center text-slate-700 hover:text-teal-500 hover:border-teal-500/20 hover:scale-110 transition-all shadow-lg"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.05] bg-white/[0.01]">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                title="Previous Page"
                                className="px-5 py-2 bg-slate-950 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 disabled:opacity-20 transition-all"
                            >
                                Prev
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                title="Next Page"
                                className="px-5 py-2 bg-slate-950 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 disabled:opacity-20 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
