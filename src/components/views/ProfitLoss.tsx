"use client";

import React, { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Plus,
    Calendar,
    PackageSearch,
    Activity,
    Lock
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AddExpenseModal from "../modals/AddExpenseModal";

export default function ProfitLoss() {
    const { expenses, orders, products } = useApp();
    const { user } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Strict Clearance Protocol
    const canView = user?.role === "Admin" || user?.permissions?.includes("reports_view") || user?.permissions?.includes("expenses_view");
    const canManageExpenses = user?.role === "Admin" || user?.permissions?.includes("expenses_manage");

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks clearance for Financial Intel protocols.</p>
            </div>
        );
    }

    // Calculate Financials
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
    const totalOperatingExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // Calculate COGS (Cost of Goods Sold)
    const cogs = orders.reduce((totalCogs: number, order: any) => {
        const orderCogs = order.items.reduce((itemSum: number, item: any) => {
            const product = products.find(p => p.id === (item.productId || item.product?.id));
            const cost = product?.costPrice || 0;
            return itemSum + (cost * item.quantity);
        }, 0);
        return totalCogs + orderCogs;
    }, 0);

    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - totalOperatingExpenses;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return (
        <div className="space-y-8 animate-fade-in text-white">
            <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <p className="text-teal-500 text-[9px] font-black uppercase tracking-[0.4em] mb-2">Financial Intelligence</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Profit & Loss</h2>
                        <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-md">
                            <span className="text-teal-500 text-[9px] font-black tracking-widest uppercase">FY 2026/27</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {canManageExpenses && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl group"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            Log Outflow
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl">
                        <Download className="w-4 h-4" />
                        Intel Export
                    </button>
                </div>
            </div>

            {/* Financial Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={totalRevenue} color="blue" icon={TrendingUp} trend="+12%" />
                <StatCard label="COGS (Stock Cost)" value={cogs} color="amber" icon={PackageSearch} detail="Inventory Outflow" />
                <StatCard label="Gross Profit" value={grossProfit} color="teal" icon={Activity} detail={`${grossMargin.toFixed(1)}% Margin`} />
                <StatCard label="Net Profit" value={netProfit} color={netProfit >= 0 ? "emerald" : "rose"} icon={DollarSign} detail={`${netMargin.toFixed(1)}% Yield`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Profitability Breakdown */}
                <div className="glass-card p-8 border-white/[0.03] bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-100">Category Alpha</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Profit contribution by vertical</p>
                        </div>
                        <PieChart className="text-teal-500 w-6 h-6 opacity-30" />
                    </div>

                    <div className="space-y-8">
                        {(() => {
                            const catData: Record<string, { rev: number, profit: number }> = {};
                            orders.forEach(o => {
                                o.items.forEach((item: any) => {
                                    const p = products.find(prod => prod.id === (item.productId || item.product?.id));
                                    const cat = p?.category || "Other";
                                    if (!catData[cat]) catData[cat] = { rev: 0, profit: 0 };
                                    catData[cat].rev += item.price * item.quantity;
                                    catData[cat].profit += (item.price - (p?.costPrice || 0)) * item.quantity;
                                });
                            });

                            const maxProfit = Math.max(...Object.values(catData).map(d => d.profit), 1);

                            return Object.entries(catData).sort((a, b) => b[1].profit - a[1].profit).slice(0, 5).map(([cat, data], i) => (
                                <div key={i} className="space-y-2.5 group">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-xs font-black text-white uppercase tracking-tight">{cat}</span>
                                            <span className="text-[8px] text-slate-500 font-black ml-2 uppercase tracking-widest">Rev: Kshs {data.rev.toLocaleString()}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-teal-400 italic">Kshs {data.profit.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500/50 to-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                                            style={{ width: `${(data.profit / maxProfit) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Operating Expenses Breakdown */}
                <div className="glass-card p-8 border-white/[0.03] bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-100">Outflow Matrix</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Non-Inventory expenditure</p>
                        </div>
                        <TrendingDown className="text-rose-500 w-6 h-6 opacity-30" />
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {expenses.length === 0 ? (
                            <div className="py-20 text-center opacity-30">
                                <p className="text-[10px] font-black uppercase tracking-widest">Clear Skies • No Expenses Recorded</p>
                            </div>
                        ) : [...expenses].reverse().map((exp, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/[0.02] rounded-xl hover:border-rose-500/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-6 bg-rose-500/30 rounded-full group-hover:bg-rose-500 transition-colors"></div>
                                    <div>
                                        <p className="font-black text-slate-200 text-xs uppercase tracking-tight leading-none mb-1.5">{exp.reason}</p>
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest leading-none">{new Date(exp.date).toLocaleDateString()} • {exp.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-rose-500 text-sm italic tracking-tighter leading-none">Kshs {exp.amount.toLocaleString()}</p>
                                    <p className="text-[7px] text-slate-700 font-extrabold uppercase mt-1">Pending Approval</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color, icon: Icon, trend, detail }: any) {
    const colorMap: any = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        teal: "text-teal-500 bg-teal-500/10 border-teal-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    };

    return (
        <div className="glass-card p-6 border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] transition-all group">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black tracking-widest">
                        <ArrowUpRight className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] mb-1.5">{label}</p>
            <h4 className="text-xl font-black text-white tracking-tighter leading-none mb-3">Kshs {value.toLocaleString()}</h4>
            {detail && <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{detail}</p>}
        </div>
    );
}
