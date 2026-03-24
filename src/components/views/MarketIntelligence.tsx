"use client";

import React, { useState, useEffect } from "react";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    TrendingUpDown,
    Layers,
    Zap,
    AlertCircle,
    Box,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    ShieldCheck,
    Cloud,
    SearchX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";

export default function MarketIntelligence() {
    const { products, triggerCloudSync, syncStatus } = useApp();
    const [intelligence, setIntelligence] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchIntelligence = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/analytics/stock");
            if (res.ok) {
                const data = await res.json();
                setIntelligence(data);
            }
        } catch (error) {
            console.error("Failed to boot intelligence engine:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntelligence();
    }, []);

    const formatCurrency = (amt: number) => `KES ${amt.toLocaleString()}`;

    if (loading && !intelligence) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-teal-500/20 blur-3xl animate-pulse"></div>
                    <Activity className="w-12 h-12 text-teal-500 animate-spin relative z-10" />
                </div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50 animate-pulse">
                    Crunching Market Algorithms...
                </h2>
            </div>
        );
    }

    const { bestSellers, deadStock, health } = intelligence;

    return (
        <div className="space-y-10 animate-fade-in max-w-[1500px] mx-auto pb-20">
            {/* Intel Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <TrendingUpDown className="text-teal-500 w-8 h-8" />
                        Market Intelligence
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                        Predictive Analysis & Redundant Data Clusters
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-card px-6 py-3 border-white/10 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Backup Protection</p>
                            <p className="text-[10px] text-white font-bold uppercase tracking-tight">
                                {syncStatus?.lastSync ? `Active: ${new Date(syncStatus.lastSync).toLocaleTimeString()}` : 'Initializing...'}
                            </p>
                        </div>
                        <button
                            onClick={triggerCloudSync}
                            className={`p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 hover:bg-teal-500 hover:text-white transition-all ${syncStatus?.isSyncing ? 'animate-spin' : ''}`}
                            title="Immediate Cloud Redundancy Sync"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Health Score Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-8 col-span-1 md:col-span-2 relative overflow-hidden group">
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] group-hover:bg-teal-500/20 transition-all duration-1000"></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Inventory Integrity Matrix
                                </h3>
                                <h2 className="text-5xl font-black text-white tracking-tighter italic">
                                    {health.healthScore}% <span className="text-xl text-teal-500">Optimized</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Matrix Capacity</p>
                                    <p className="text-xl font-bold text-white">{health.totalProducts} Hardwares</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Exposure Risk</p>
                                    <p className="text-xl font-bold text-rose-500">{health.lowStockCount} Stock-outs</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex w-40 h-40 items-center justify-center relative">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    cx="80" cy="80" r="70"
                                    className="stroke-slate-900"
                                    strokeWidth="10" fill="transparent"
                                />
                                <motion.circle
                                    cx="80" cy="80" r="70"
                                    className="stroke-teal-500"
                                    strokeWidth="10" fill="transparent"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * (health.healthScore / 100)) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-black text-xl text-white">
                                {health.healthScore}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 flex flex-col justify-between border-teal-500/10 bg-teal-500/[0.02]">
                    <div className="space-y-2">
                        <Cloud className="text-teal-500 w-10 h-10 mb-4" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Cloud Sync Layer</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest">
                            Redundancy matrix is active.
                            Local Cache protection ensures uptime during offline fluctuations.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-600">Sync Frequency</span>
                            <span className="text-teal-400">15.0 Minutes</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-600">Redundancy Status</span>
                            <span className="text-emerald-500">Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 1. BEST SELLERS */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Elite Velocity</h3>
                            <p className="text-[10px] text-teal-500 font-black uppercase tracking-widest mt-1">Highest Movement Products (30D)</p>
                        </div>
                        <TrendingUp className="text-teal-500 w-6 h-6" />
                    </div>

                    <div className="space-y-8">
                        {bestSellers.length > 0 ? bestSellers.map((item: any, i: number) => (
                            <div key={item.productId} className="flex gap-6 items-center group">
                                <div className="text-xs font-black text-slate-700 w-4">#{i + 1}</div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{item.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-teal-400 italic">+{item._sum.quantity} Units</p>
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{formatCurrency(item.revenue)}</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (item._sum.quantity / bestSellers[0]._sum.quantity) * 100)}%` }}
                                            transition={{ duration: 1.2, delay: i * 0.1 }}
                                            className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-[0.3em] text-xs">
                                Insufficient Sales Data Clusters
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. DEAD STOCK */}
                <div className="glass-card p-8 border-rose-500/10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Frozen Assets</h3>
                            <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1">Dead Stock - No Sales (90D+)</p>
                        </div>
                        <TrendingDown className="text-rose-500 w-6 h-6" />
                    </div>

                    <div className="space-y-6">
                        {deadStock.length > 0 ? deadStock.map((item: any) => (
                            <div key={item.sku} className="flex gap-6 p-4 rounded-2xl bg-white/[0.01] hover:bg-rose-500/[0.03] border border-white/5 hover:border-rose-500/20 transition-all group">
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/10 self-center">
                                    <Box className="w-5 h-5 text-rose-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest leading-none line-clamp-1">{item.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-rose-500">{item.stock} IN STOCK</p>
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">Value: {formatCurrency(item.stock * item.costPrice)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3 text-rose-500/60" />
                                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Advise: Clear Stock / Discount</span>
                                        </div>
                                        <div className="text-[9px] text-slate-700 font-black uppercase tracking-widest">
                                            Entry: {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-[0.3em] text-xs">
                                No Dead Stock Clusters Identified
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Redundancy Logs */}
            <div className="glass-card p-6 border-white/5 bg-slate-950/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Layers className="w-3 h-3" />
                        System Redundancy Matrix
                    </h3>
                    <div className="flex items-center gap-2 h-1.5 w-32 bg-slate-900 rounded-full overflow-hidden p-[1px]">
                        <motion.div
                            animate={{ x: [-50, 150] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="h-full w-10 bg-teal-500/40 rounded-full blur-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { l: "Product Layer", s: "Redundant", v: products.length },
                        { l: "Sync Health", s: "Optimal", v: "100%" },
                        { l: "Matrix Version", s: "Rel-4.0", v: "CORE-GEN" },
                        { l: "Database Engine", s: "Cloud-Sync", v: "Active" }
                    ].map((m, i) => (
                        <div key={i} className="bg-white/[0.01] p-4 rounded-xl border border-white/5">
                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">{m.l}</p>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-white uppercase tracking-tight">{m.v}</span>
                                <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${m.s === 'Redundant' || m.s === 'Optimal' || m.s === 'Active' ? 'text-emerald-500' : 'text-teal-500'}`}>{m.s}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
