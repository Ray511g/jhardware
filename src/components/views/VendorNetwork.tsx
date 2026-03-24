"use client";

import React, { useState } from "react";
import {
    Users,
    Search,
    Plus,
    Phone,
    Mail,
    MapPin,
    Star,
    ShieldCheck,
    TrendingUp,
    ExternalLink,
    Building2,
    Briefcase,
    Zap,
    MoreVertical,
    Trash2,
    Edit3,
    ArrowUpRight,
    SearchX,
    Lock,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AddVendorModal from "../modals/AddVendorModal";

export default function VendorNetwork() {
    const { vendors, deleteVendor, resyncVendor } = useApp();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [editingVendor, setEditingVendor] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Strict Clearance Protocol
    const hasFullPower = user?.role === "Admin";
    const canView = hasFullPower || user?.permissions?.includes("partners_view") || user?.permissions?.includes("partners_manage");
    const canManage = hasFullPower || user?.permissions?.includes("partners_manage");

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks clearance for Trade Partner Protocols.</p>
            </div>
        );
    }

    const categories = ["All", "Distributor", "Manufacturer", "Wholesaler", "Logistics"];

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || v.type === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

    const totalBalance = vendors.reduce((acc, v) => acc + v.balance, 0);
    const verifiedCount = vendors.filter(v => v.rating >= 4.5).length;

    const handleDelete = async (id: string, name: string) => {
        if (!canManage) return;
        if (confirm(`SECURITY PROTOCOL: Purge ${name} from network matrix?`)) {
            await deleteVendor(id);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto">
            <AddVendorModal
                isOpen={isAddModalOpen || !!editingVendor}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingVendor(null);
                }}
                vendor={editingVendor}
            />

            {/* Header Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Network Capacity", value: vendors.length, sub: "Registered Partners", icon: Users, color: "teal" },
                    { label: "Verified Tier", value: verifiedCount, sub: "Elite Excellence", icon: ShieldCheck, color: "emerald" },
                    { label: "Network Liquidity", value: `Kshs ${Math.abs(totalBalance).toLocaleString()}`, sub: totalBalance < 0 ? "Total Debt" : "Total Credit", icon: TrendingUp, color: totalBalance < 0 ? "rose" : "amber" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 border-white/[0.03] bg-white/[0.01] relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-white tracking-tighter">{stat.value}</h3>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{stat.sub}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-950/50 border border-white/5 p-3 rounded-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat
                                ? "bg-teal-500 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative group flex-1 lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="FILTER NETWORK..."
                            className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-black tracking-widest text-white focus:outline-none focus:border-teal-500/30 transition-all placeholder-slate-800"
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    {canManage && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-3 px-6 py-3 premium-gradient text-white rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Onboard Partner
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Section */}
            <AnimatePresence mode="popLayout">
                {paginatedVendors.length > 0 ? (
                    <div key="grid-container">
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {paginatedVendors.map((vendor) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={vendor.id}
                                    className="glass-card p-6 border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {canManage ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingVendor(vendor)}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-teal-500 hover:border-teal-500/30 transition-all"
                                                    title="Edit Profile"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vendor.id, vendor.name)}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                                                    title="Terminate Partnership"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">READ_ONLY</span>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all duration-300">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] rounded">{vendor.type}</span>
                                                {vendor.rating >= 4.5 && (
                                                    <div className="token-verified flex items-center gap-1 text-[8px] font-black text-emerald-500">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        <span>ELITE</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-base font-black text-white uppercase tracking-tighter leading-tight line-clamp-1">{vendor.name}</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                                            <div className="w-7 h-7 rounded-lg bg-white/[0.02] flex items-center justify-center">
                                                <Phone className="w-3.5 h-3.5 text-teal-500/20" />
                                            </div>
                                            <span className="text-[11px] font-bold font-mono tracking-tight">{vendor.contact}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                                            <div className="w-7 h-7 rounded-lg bg-white/[0.02] flex items-center justify-center">
                                                <Mail className="w-3.5 h-3.5 text-teal-500/20" />
                                            </div>
                                            <span className="text-[11px] font-bold tracking-tight line-clamp-1 lowercase italic opacity-80">{vendor.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                                            <div className="w-7 h-7 rounded-lg bg-white/[0.02] flex items-center justify-center">
                                                <MapPin className="w-3.5 h-3.5 text-teal-500/20" />
                                            </div>
                                            <span className="text-[10px] font-bold tracking-[0.1em] uppercase line-clamp-1 opacity-70">{vendor.address}</span>
                                        </div>
                                    </div>

                                    <div className="pt-5 border-t border-white/5 flex items-center justify-between bg-gradient-to-t from-white/[0.01] to-transparent rounded-b-xl -mx-6 px-6 -mb-6 pb-6">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                                <TrendingUp className="w-2.5 h-2.5" />
                                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Balance Ledger</p>
                                            </div>
                                            <p className={`text-lg font-black tracking-tighter ${vendor.balance < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                                Kshs {Math.abs(vendor.balance).toLocaleString()}
                                                <span className="text-[8px] ml-1.5 opacity-40 uppercase font-black tracking-widest tracking-tighter">
                                                    {vendor.balance < 0 ? 'Owed' : 'Credit'}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-950 border border-white/5 shadow-xl group-hover:border-teal-500/30 transition-all">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shadow-glow-amber" />
                                            <span className="font-black text-white text-xs">{vendor.rating}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-6 border-t border-white/[0.05] mt-8 bg-white/[0.01] rounded-2xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Displaying {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredVendors.length)} of {filteredVendors.length} partners
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="p-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <div className="flex items-center px-4 bg-teal-500/5 border border-teal-500/10 rounded-xl text-[10px] font-black text-teal-500 uppercase tracking-widest min-w-[100px] justify-center">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="p-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                                    >
                                        <ChevronRightIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key="empty-state"
                        className="flex flex-col items-center justify-center py-40 glass-card bg-slate-950/20"
                    >
                        <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-800 mb-6">
                            <SearchX size={40} />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-widest uppercase mb-2">No Network Matches</h3>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] text-center max-w-xs leading-loose">
                            Your search parameters yielded zero results in the current category.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
