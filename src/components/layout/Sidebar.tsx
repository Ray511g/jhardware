"use client";

import React from "react";
import {
    History,
    LayoutDashboard,
    Printer,
    Package,
    Users,
    ArrowDownToLine,
    BookOpen,
    TrendingUp,
    UserCog,
    FileSearch,
    Settings,
    ChevronRight,
    ShieldAlert,
    ShieldCheck
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", perm: "dashboard_view" },
    { icon: Printer, label: "POS Terminal", id: "pos", perm: "pos_terminal" },
    { icon: History, label: "Sales History", id: "sales", perm: "pos_terminal" },
    { icon: Package, label: "Inventory & Stock", id: "inventory", perm: "inventory_view" },
    { icon: Users, label: "Vendor Network", id: "vendors", perm: "partners_view" },
    { icon: ArrowDownToLine, label: "Stock Inward / PO", id: "stock-in", perm: "inventory_edit" },
    { icon: BookOpen, label: "Contractor Ledger", id: "ledger", perm: "partners_view" },
    { icon: TrendingUp, label: "Profit & Loss", id: "p-and-l", perm: "reports_view" },
    { icon: UserCog, label: "Personnel Matrix", id: "staff", perm: "staff_manage" },
    { icon: ShieldAlert, label: "Audit Protocol", id: "audit-logs", perm: "audit_view" },
    { icon: FileSearch, label: "Market Intelligence", id: "analytics", perm: "reports_view" },
    { icon: Settings, label: "Business Config", id: "config", perm: "settings_manage" },
];

import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { LogOut } from "lucide-react";

export default function Sidebar({ activeModule, setActiveModule }: {
    activeModule: string;
    setActiveModule: (id: string) => void;
}) {
    const { user, logout } = useAuth();
    const { config } = useApp();

    const allowedItems = menuItems.filter(item => {
        if (user?.role === "Admin") return true;
        const userPerms = user?.permissions || [];
        return userPerms.includes(item.perm);
    });

    return (
        <aside className="w-72 h-screen bg-slate-950 border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center glow-teal">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-200 uppercase tracking-tighter">
                        {config?.name || "Biashara POS"}
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {allowedItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveModule(item.id)}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group",
                            activeModule === item.id
                                ? "bg-teal-600/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_-3px_rgba(20,184,166,0.2)]"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                activeModule === item.id ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        {activeModule === item.id && (
                            <ChevronRight className="w-4 h-4 text-teal-500/50" />
                        )}
                    </button>
                ))}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-white/5 bg-slate-900/20">
                <div className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 font-black text-[10px] border border-teal-500/20">
                        {user?.name?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-200 uppercase truncate">{user?.name}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{user?.role}</p>
                    </div>
                    <button onClick={logout} title="Purge Session (Logout)" className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors">
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
