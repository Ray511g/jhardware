"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import POSTerminal from "@/components/views/POSTerminal";
import InventoryView from "@/components/views/InventoryView";
import VendorNetwork from "@/components/views/VendorNetwork";
import StockInward from "@/components/views/StockInward";
import ContractorLedger from "@/components/views/ContractorLedger";
import ProfitLoss from "@/components/views/ProfitLoss";
import StaffControl from "@/components/views/StaffControl";
import TaxReports from "@/components/views/TaxReports";
import SalesHistory from "@/components/views/SalesHistory";
import BusinessConfigView from "@/components/views/BusinessConfigView";
import ReportIntelligence from "@/components/views/ReportIntelligence";
import AuditProtocol from "@/components/views/AuditProtocol";
import MarketIntelligence from "@/components/views/MarketIntelligence";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  LayoutDashboard,
  Bell,
  Search,
  Settings,
  ShieldCheck,
  Activity,
  Download,
  History,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [activeModule, setActiveModule] = React.useState("dashboard");
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const { isLoading, config, products, orders, vendors } = useApp();
  const lowStockCount = React.useMemo(() => products?.filter(p => p.stock < p.minStock).length || 0, [products]);
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Session gap. Jumping to Security Gateway...");
      logout().finally(() => {
        window.location.href = "/login";
      });
      const timer = setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    // Strict Profile Routing
    if (isAuthenticated && user && activeModule === "dashboard") {
      const perms = user.permissions || [];
      const isAdmin = user.role === "Admin";

      if (!isAdmin && !perms.includes("dashboard_view")) {
        if (perms.includes("inventory_view")) setActiveModule("inventory");
        else if (perms.includes("pos_terminal")) setActiveModule("pos");
        else if (perms.includes("partners_view")) setActiveModule("vendors");
        else if (perms.includes("reports_view")) setActiveModule("reports");
        else setActiveModule("none");
      }
    }
  }, [authLoading, isAuthenticated, logout, user, activeModule]);

  const renderedModule = React.useMemo(() => {
    switch (activeModule) {
      case "dashboard": return <DashboardView />;
      case "pos": return <POSTerminal />;
      case "sales": return <SalesHistory />;
      case "inventory": return <InventoryView />;
      case "vendors": return <VendorNetwork />;
      case "stock-in": return <StockInward />;
      case "ledger": return <ContractorLedger />;
      case "p-and-l": return <ProfitLoss />;
      case "staff": return <StaffControl />;
      case "audit-logs": return <AuditProtocol />;
      case "analytics": return <MarketIntelligence />;
      case "reports": return <ReportIntelligence />;
      case "config": return <BusinessConfigView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in">
            <Settings className="w-16 h-16 text-teal-500 mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-widest">Configuration Active</h2>
            <p className="text-slate-500 mt-2 font-medium">Enterprise settings are synchronized.</p>
          </div>
        );
    }
  }, [activeModule, products, orders, vendors, config, lowStockCount]);

  if (isLoading || authLoading || !isAuthenticated) {
    const isUnauthenticated = !isAuthenticated && !authLoading;

    return (
      <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-teal-500/20 blur-[60px] animate-pulse"></div>
          <div className="w-24 h-24 bg-slate-900/80 rounded-3xl flex items-center justify-center border border-teal-500/30 shadow-[0_0_50px_rgba(13,148,136,0.2)] relative z-10 transition-transform">
            {isUnauthenticated ? (
              <ShieldCheck className="w-12 h-12 text-rose-500 animate-pulse" />
            ) : (
              <Package className="w-12 h-12 text-teal-500" />
            )}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 relative z-10 text-center max-w-sm">
          <h2 className="text-white font-black uppercase tracking-[0.6em] text-[11px] animate-pulse">
            {isUnauthenticated ? "Authenticating Session Profile" : "Booting Biashara Core"}
          </h2>
          <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-full w-24 bg-gradient-to-r from-transparent via-teal-500 to-transparent"
            />
          </div>
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
            {isUnauthenticated
              ? "If you are not redirected in 2 seconds, click the manual bridge below."
              : "Synchronizing localized data clusters... Please standby."}
          </p>

          {isUnauthenticated && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => window.location.href = "/login"}
              className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 hover:bg-teal-500 hover:text-white transition-all active:scale-95"
            >
              Enter Security Gateway
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen selection:bg-teal-500 selection:text-white">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

      <div className="pl-72 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/[0.08] via-slate-950 to-slate-950 transition-all duration-700">
        <div className="p-6 max-w-[1700px] mx-auto">
          {/* Top Bar - High Density Enterprise Style */}
          <div className="flex items-center justify-between mb-6 bg-white/[0.01] border border-white/[0.05] p-2.5 rounded-2xl backdrop-blur-3xl shadow-2xl">
            <div className="relative w-[350px] ml-2 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-teal-500 transition-colors" />
              <input
                type="text"
                placeholder="Search System..."
                className="w-full bg-slate-950/50 border border-white/[0.03] rounded-xl py-2.5 pl-12 pr-6 focus:outline-none text-[11px] transition-all focus:border-teal-500/30 font-bold uppercase tracking-tight text-white placeholder-slate-700"
              />
            </div>
            <div className="flex items-center gap-6 pr-4">

              <div className="h-6 w-px bg-white/5"></div>
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 bg-slate-900/50 border border-white/5 rounded-xl hover:bg-slate-900 transition-all group"
                >
                  <Bell className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                  {lowStockCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-4 w-80 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-between">
                        System Alerts
                        {lowStockCount > 0 && <span className="bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full">{lowStockCount} Critical</span>}
                      </h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                      {lowStockCount > 0 ? products?.filter(p => p.stock < p.minStock).map(p => (
                        <div key={p.id} className="p-3 border-b last:border-0 border-white/5 hover:bg-white/[0.02] flex gap-3 transition-colors cursor-pointer rounded-xl" onClick={() => { setActiveModule("inventory"); setIsNotificationsOpen(false); }}>
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                            <Package className="w-4 h-4 text-rose-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white uppercase tracking-wider line-clamp-1">{p.name}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                              <span className="text-rose-500">Stock: {p.stock}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                              <span>Min: {p.minStock}</span>
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          No active alerts
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-white/5"></div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <p className="text-[11px] font-black text-white uppercase tracking-tight">{user?.name || "Personnel"}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user?.role || "GUEST"}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xs shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                  {initials}
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:bg-rose-500 transition-all hover:text-white group relative"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-[60vh]">
            {renderedModule}
          </div>
        </div>
      </div>
    </main>
  );
}

const DashboardView = React.memo(() => {
  const { orders, products, vendors } = useApp();

  const stats = React.useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStockCount = products.filter(p => p.stock < p.minStock).length;
    return { totalRevenue, lowStockCount };
  }, [orders, products]);

  const performanceMetrics = React.useMemo(() => {
    const salesMap: Record<string, number> = {};
    orders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          if (item && item.productId && item.quantity) {
            salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
          }
        });
      }
    });

    const performance = products.map(p => ({
      ...p,
      sales: salesMap[p.id] || 0
    })).sort((a, b) => b.sales - a.sales);

    const highPerformers = performance.slice(0, 3);
    const lowPerformers = performance.filter(p => p.sales < 2).slice(-3);
    const maxSales = Math.max(...performance.map(p => p.sales), 1);

    return { highPerformers, lowPerformers, maxSales };
  }, [orders, products]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Prime Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Live Revenue", value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, trend: "+12.5%", color: "teal" },
          { label: "Daily Volume", value: orders.length.toString(), icon: ShoppingBag, trend: "+4.2%", color: "blue" },
          { label: "Risk Items", value: stats.lowStockCount.toString(), icon: Package, trend: `-${stats.lowStockCount}`, color: "rose" },
          { label: "Supply Chain", value: `${vendors.length} Partners`, icon: Users, trend: "+1", color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${stat.color}-500 opacity-[0.02] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity`}></div>
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-xl border border-${stat.color}-500/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase",
                stat.color === "rose" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-400"
              )}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-white tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-8 border-white/[0.03] bg-white/[0.01]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black mb-1 uppercase tracking-tighter text-slate-100 italic">Inventory Velocity</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-80">Telemetry of product throughput...</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-4">Elite Performers (Volume)</p>
                {performanceMetrics.highPerformers.map((item: any, i: number) => (
                  <div key={i} className="space-y-2 group">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-white uppercase tracking-tight">{item.name}</span>
                      <span className="text-[10px] font-black text-teal-400">{item.sales} Units</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.sales / performanceMetrics.maxSales) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-4">Critical Stagnancy (Low Flow)</p>
                {performanceMetrics.lowPerformers.map((item: any, i: number) => (
                  <div key={i} className="space-y-2 group">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-white/60 uppercase tracking-tight">{item.name}</span>
                      <span className="text-[10px] font-black text-rose-500/60">{item.sales} Units</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, (item.sales / performanceMetrics.maxSales) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 border-white/[0.03] bg-white/[0.01]">
            <h3 className="text-xl font-black mb-8 text-slate-100 uppercase tracking-tighter italic">Risk Intel</h3>
            <div className="space-y-8">
              {products.filter(p => p.stock < p.minStock).slice(0, 4).map((item: any, i: number) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-1 rounded-full bg-rose-500 h-14 group-hover:h-16 transition-all duration-500"></div>
                  <div>
                    <p className="text-sm font-black text-white mb-2 uppercase tracking-tight">{item.name}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-[9px] text-rose-500/80 font-black uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">Critical Stock: {item.stock}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Min: {item.minStock}</p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.lowStockCount === 0 && (
                <p className="text-center py-10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">Inventory Health 100%</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
