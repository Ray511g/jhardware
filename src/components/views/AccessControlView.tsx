"use client";

import React, { useState } from "react";
import {
    Shield,
    ShieldCheck,
    Lock,
    Search,
    Plus,
    ChevronRight,
    ChevronDown,
    Save,
    RotateCcw,
    Activity,
    CheckCircle2,
    Users,
    Package,
    ShoppingBag,
    TrendingDown,
    CreditCard,
    Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Hierarchical Protocol Definition
const PROTOCOL_MAP = [
    {
        id: "personnel",
        label: "Personnel Management",
        icon: Users,
        children: [
            { id: "staff_view", label: "View Registry" },
            { id: "staff_add", label: "Provision Profile (Add)" },
            { id: "staff_edit", label: "Modify Profile (Edit)" },
            { id: "staff_delete", label: "Purge Personnel (Delete)" },
            { id: "audit_view", label: "Security Audit" },
        ]
    },
    {
        id: "inventory",
        label: "Inventory Logistics",
        icon: Package,
        children: [
            { id: "inventory_view", label: "View Stock" },
            { id: "inventory_add", label: "Add New Unit" },
            { id: "inventory_edit", label: "Modify Manifest (Edit)" },
            { id: "inventory_delete", label: "Purge Stock Unit (Delete)" },
            { id: "stock_in", label: "Stock Inward Processing" },
        ]
    },
    {
        id: "terminal",
        label: "Terminal Protocols",
        icon: ShoppingBag,
        children: [
            { id: "pos_terminal", label: "Terminal Access" },
            { id: "pos_void", label: "Void Transaction" },
            { id: "pos_discount", label: "Price Override" },
            { id: "pos_return", label: "Process Returns" },
        ]
    },
    {
        id: "sales",
        label: "Sales Intelligence",
        icon: TrendingDown,
        children: [
            { id: "sales_view", label: "View Sales Logs" },
            { id: "sales_edit", label: "Modify Records" },
            { id: "sales_delete", label: "Purge Sale Entry" },
            { id: "sales_report", label: "Data Export" },
        ]
    },
    {
        id: "vendors",
        label: "Supply Partner Network",
        icon: Users,
        children: [
            { id: "vendors_view", label: "View Vendors" },
            { id: "vendors_add", label: "Add Partner" },
            { id: "vendors_edit", label: "Edit Partner" },
            { id: "vendors_delete", label: "Purge Partner" },
        ]
    },
    {
        id: "ledger",
        label: "Fiscal Ledgers (Contractors)",
        icon: CreditCard,
        children: [
            { id: "ledger_view", label: "View Ledger" },
            { id: "ledger_add", label: "Post Payment (Add)" },
            { id: "ledger_edit", label: "Modify Entry" },
            { id: "ledger_delete", label: "Purge Entry" },
        ]
    },
    {
        id: "expenses",
        label: "Expenditure Control",
        icon: TrendingDown,
        children: [
            { id: "expenses_view", label: "View Expenses" },
            { id: "expenses_add", label: "Record Outflow (Add)" },
            { id: "expenses_edit", label: "Modify Expense" },
            { id: "expenses_delete", label: "Purge Expense" },
        ]
    },
    {
        id: "system",
        label: "System Infrastructure",
        icon: Settings,
        children: [
            { id: "settings_view", label: "View Config" },
            { id: "settings_edit", label: "Modify System Logic (Edit)" },
            { id: "tax_manage", label: "Tax Compliance" },
            { id: "backup_exec", label: "Data Synchronization" },
        ]
    }
];

export default function AccessControlView() {
    const { user } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState<string[]>(["personnel", "terminal"]);
    const [selectedRole, setSelectedRole] = useState("Admin");
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const togglePermission = (id: string) => {
        setRolePermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const canManage = user?.role === "Admin" || user?.permissions?.includes("settings_manage");

    if (!canManage) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks sufficient clearance for Security Matrix configuration.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-10 pb-20 text-white selection:bg-amber-500/30">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Security <span className="text-amber-500">Protocols</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mt-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        Hierarchical Authorization Matrix
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all text-slate-300">
                        Clone Protocol
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 premium-gradient rounded-xl font-black uppercase tracking-[0.2em] shadow-xl text-[10px] hover:scale-105 transition-all text-white">
                        <Plus className="w-4 h-4" />
                        New Security Role
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Role Sidebar */}
                <div className="lg:col-span-3 space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-4">Role Registry</p>
                    {["Admin", "Manager", "Cashier", "Supervisor"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${selectedRole === role
                                ? "bg-amber-500/10 border-amber-500/30 text-white shadow-lg shadow-amber-500/5"
                                : "bg-slate-950 border-white/5 text-slate-500 hover:border-white/10"
                                }`}
                        >
                            {selectedRole === role && (
                                <motion.div layoutId="activeRole" className="absolute inset-y-0 left-0 w-1 bg-amber-500" />
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-wider">{role}</span>
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedRole === role ? "rotate-90 text-amber-500" : "text-slate-800"}`} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Protocol Tree Designer */}
                <div className="lg:col-span-9 bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                <Shield className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none mb-1">Clearance: {selectedRole}</h3>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Configure hierarchy-based authorization rules</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"><RotateCcw size={16} /></button>
                            <button className="flex items-center gap-3 px-8 py-3 premium-gradient rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                <Save className="w-4 h-4" />
                                Save Protocol Logic
                            </button>
                        </div>
                    </div>

                    {/* The Tree Structure */}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                        {PROTOCOL_MAP.map((group) => (
                            <div key={group.id} className="space-y-1">
                                {/* Parent Branch */}
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${expandedGroups.includes(group.id)
                                        ? "bg-white/[0.03] border-white/10"
                                        : "bg-transparent border-transparent hover:bg-white/[0.02]"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg transition-colors ${expandedGroups.includes(group.id) ? "bg-amber-500/20 text-amber-500" : "bg-slate-900 text-slate-600"}`}>
                                            <group.icon size={16} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">{group.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{group.children.length} RULES</span>
                                        {expandedGroups.includes(group.id) ? <ChevronDown size={14} className="text-slate-700" /> : <ChevronRight size={14} className="text-slate-700" />}
                                    </div>
                                </button>

                                {/* Child Nodes */}
                                <AnimatePresence>
                                    {expandedGroups.includes(group.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden pl-16 space-y-2 py-2 relative"
                                        >
                                            {/* Visual connection line */}
                                            <div className="absolute left-[2.2rem] top-0 bottom-4 w-px bg-white/5"></div>

                                            {group.children.map((child) => (
                                                <label
                                                    key={child.id}
                                                    className="flex items-center justify-between px-6 py-3.5 bg-slate-950/40 rounded-xl border border-white/[0.03] hover:border-amber-500/20 group/node cursor-pointer transition-all relative"
                                                >
                                                    {/* Horizontal connector link */}
                                                    <div className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 w-4 h-px bg-white/10"></div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-5 h-5 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center group-hover/node:border-amber-500/40 transition-all">
                                                            <div className={`w-3 h-3 bg-amber-500 rounded-md transition-all duration-300 ${rolePermissions.includes(child.id) ? "opacity-100 scale-100 glow-amber" : "opacity-0 scale-50"}`}></div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={rolePermissions.includes(child.id)}
                                                                onChange={() => togglePermission(child.id)}
                                                            />
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${rolePermissions.includes(child.id) ? "text-slate-100" : "text-slate-500 group-hover/node:text-slate-300"}`}>
                                                            {child.label}
                                                        </span>
                                                    </div>
                                                    {rolePermissions.includes(child.id) && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500/40 animate-pulse" />
                                                    )}
                                                </label>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Stats Footer */}
                    <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Auth Rules: {rolePermissions.length}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500/50"></span>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Integrity: 99.8%</p>
                            </div>
                        </div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Protocol v5.2A High-Density Matrix</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
