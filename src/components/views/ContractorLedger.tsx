"use client";

import React, { useState } from "react";
import {
    Search,
    ChevronRight,
    ChevronLeft,
    Plus,
    CreditCard,
    Users,
    TrendingDown,
    ShieldCheck,
    ArrowUpRight,
    Wallet,
    Lock
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AddContractorModal from "../modals/AddContractorModal";
import ContractorDetailModal from "../modals/ContractorDetailModal";

export default function ContractorLedger() {
    const { contractors } = useApp();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Strict Clearance Protocol
    const hasFullPower = user?.role === "Admin";
    const canView = hasFullPower || user?.permissions?.includes("partners_view") || user?.permissions?.includes("partners_manage");
    const canManage = hasFullPower || user?.permissions?.includes("partners_manage");

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks clearance for Contractor Trust Matrix.</p>
            </div>
        );
    }

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredContractors = contractors.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    const totalPages = Math.ceil(filteredContractors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedContractors = filteredContractors.slice(startIndex, startIndex + itemsPerPage);

    const totalBalance = contractors.reduce((acc, current) => acc + current.balance, 0);

    return (
        <div className="space-y-8 animate-fade-in relative z-10 text-white">
            <AddContractorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <ContractorDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                contractor={selectedContractor}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Ledger <span className="text-amber-500">Account</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-amber-500" />
                        Contractor Trust Matrix
                    </p>
                </div>
                {canManage && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2.5 px-6 py-3 premium-gradient text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Provision Account
                        </button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Debt Payload", value: `Kshs ${totalBalance.toLocaleString()}`, icon: TrendingDown, color: "from-amber-500/20 to-transparent", textColor: "text-amber-500", border: "border-amber-500/20" },
                    { label: "Active Accounts", value: contractors.length, icon: Users, color: "from-blue-500/20 to-transparent", textColor: "text-blue-400", border: "border-blue-500/20" },
                    { label: "Trust Integrity", value: "98.4%", icon: ShieldCheck, color: "from-emerald-500/20 to-transparent", textColor: "text-emerald-400", border: "border-emerald-500/20" },
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

            {/* Search */}
            <div className="glass-card p-2 border-white/[0.03] bg-white/[0.01]">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Scan trust matrix for contractor ID or alias..."
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-amber-500/30 transition-all placeholder-slate-700"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Ledger List */}
            <div className="glass-card border-white/[0.03] bg-white/[0.01] overflow-hidden">
                <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-amber-500" />
                            Account Registry
                        </h3>
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-1">Real-time balance monitoring</p>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest px-3">
                                Page {currentPage} / {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="divide-y divide-white/[0.02]">
                    {paginatedContractors.length === 0 ? (
                        <div className="py-24 text-center">
                            <ShieldCheck className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">No accounts detected in current scan</p>
                        </div>
                    ) : paginatedContractors.map((contractor) => (
                        <div
                            key={contractor.id}
                            onClick={() => {
                                setSelectedContractor(contractor);
                                setIsDetailModalOpen(true);
                            }}
                            className="group hover:bg-white/[0.01] transition-all p-5 cursor-pointer"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-amber-500/5">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h5 className="text-lg font-black text-white uppercase tracking-tighter leading-none group-hover:text-amber-400 transition-colors">{contractor.name}</h5>
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{contractor.phone}</p>
                                            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                                Verified Account
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-10">
                                    <div className="text-right">
                                        <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">Owed Balance</p>
                                        <p className={`text-xl font-black italic tracking-tighter mt-1 ${contractor.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            Kshs {contractor.balance.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-center text-slate-700 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all shadow-lg group-hover:scale-110">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

