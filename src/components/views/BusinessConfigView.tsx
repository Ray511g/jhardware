"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    Save,
    Building2,
    MapPin,
    Phone,
    Mail,
    Fingerprint,
    Percent,
    Wallet,
    ShieldCheck,
    CreditCard,
    RotateCcw,
    AlertTriangle,
    Lock,
    Globe,
    Zap,
    FileText,
    Upload,
    FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export default function BusinessConfigView() {
    const { config, updateConfig, resetSystem } = useApp();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"settings" | "reset" | "bulk">("settings");
    const [resetConfirmation, setResetConfirmation] = useState("");
    const [isResetting, setIsResetting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        phone: "",
        email: "",
        taxNumber: "",
        taxPercentage: 16.0,
        taxInclusive: true,
        mpesaTill: "",
        mpesaPaybill: "",
        mpesaAccount: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    // Strict Clearance Protocol
    const canManage = user?.role === "Admin" || user?.permissions?.includes("settings_manage");

    useEffect(() => {
        if (config) {
            setFormData({
                name: config.name || "",
                location: config.location || "",
                phone: config.phone || "",
                email: config.email || "",
                taxNumber: config.taxNumber || "",
                taxPercentage: config.taxPercentage || 16.0,
                taxInclusive: config.taxInclusive ?? true,
                mpesaTill: config.mpesaTill || "",
                mpesaPaybill: config.mpesaPaybill || "",
                mpesaAccount: config.mpesaAccount || ""
            });
        }
    }, [config]);

    if (!canManage) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks clearance for System Backbone configuration.</p>
            </div>
        );
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateConfig(formData);
            alert("System Configuration Synchronized Successfully.");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (resetConfirmation !== "RESET") {
            alert("Security Protocol: Invalid confirmation code.");
            return;
        }

        if (!confirm("CRITICAL WARNING: This will permanently delete all sales, expenses, and procurement history. Dashboard metrics will return to zero. Continue?")) return;

        setIsResetting(true);
        try {
            await resetSystem("RESET");
            setResetConfirmation("");
            setActiveTab("settings");
        } catch (error) {
            console.error(error);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20 text-white">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Core <span className="text-teal-500">Backbone</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mt-2">
                        <Settings className="w-3.5 h-3.5 text-teal-500" />
                        System Global Parameters
                    </p>
                </div>

                <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/5">
                    {[
                        { id: "settings", label: "Global Settings", icon: Settings },
                        { id: "bulk", label: "Inventory Protocol", icon: Building2 },
                        { id: "reset", label: "System Reset", icon: RotateCcw },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "settings" ? (

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Identity Module */}
                    <div className="glass-card p-8 border-white/[0.03] bg-white/[0.01]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
                            <Building2 className="w-5 h-5 text-teal-500" />
                            Business Identity
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Trade Name</label>
                                <input
                                    required
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Terminal Location</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Support Channel (Phone)</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Registry Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fiscal Module */}
                    <div className="glass-card p-8 border-teal-500/10 bg-teal-500/[0.01]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
                            <ShieldCheck className="w-5 h-5 text-teal-400" />
                            Fiscal Compliance
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">KRA PIN / Tax ID</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-teal-400 focus:outline-none focus:border-teal-500/30 transition-all"
                                    value={formData.taxNumber}
                                    onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">VAT Percentage (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all"
                                    value={formData.taxPercentage}
                                    onChange={e => setFormData({ ...formData, taxPercentage: Number(e.target.value) })}
                                />
                            </div>

                            <div className="md:col-span-2 p-6 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Percent className="w-6 h-6 text-teal-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Tax Inclusive Pricing</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">If enabled, the listed shelf price already includes VAT.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, taxInclusive: !formData.taxInclusive })}
                                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${formData.taxInclusive ? 'bg-teal-500' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-xl ${formData.taxInclusive ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Financial Gateways */}
                    <div className="glass-card p-8 border-amber-500/10 bg-amber-500/[0.01]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-amber-500" />
                                Settlement Channels (M-PESA)
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Lipa Na M-Pesa Till</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-amber-500/30 transition-all"
                                    value={formData.mpesaTill}
                                    onChange={e => setFormData({ ...formData, mpesaTill: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">M-Pesa Paybill</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-amber-500/30 transition-all"
                                    value={formData.mpesaPaybill}
                                    onChange={e => setFormData({ ...formData, mpesaPaybill: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Account / Reference</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-amber-500/30 transition-all"
                                    value={formData.mpesaAccount}
                                    onChange={e => setFormData({ ...formData, mpesaAccount: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* M-Pesa URL Registration Bridge */}
                        <div className="p-6 bg-slate-900/50 border border-white/10 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-500/10 rounded-lg">
                                    <Globe className="w-4 h-4 text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Callback Registration Bridge</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Connect your Till to Safaricom's real-time notification engine.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                                <div className="flex-1 bg-black/40 border border-white/5 px-4 py-3 rounded-xl w-full">
                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Target Endpoint</p>
                                    <p className="text-[11px] font-mono text-teal-500 truncate">{process.env.NEXT_PUBLIC_APP_URL || 'https://domain.com'}/api/mpesa/callback</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm("Initiate C2B Callback Registration with Safaricom Production API?")) return;
                                        try {
                                            const res = await fetch("/api/mpesa/register", { method: "POST" });
                                            const data = await res.json();
                                            if (data.success) alert("Protocol Synchronized: C2B Registration Successful.");
                                            else throw new Error(data.error || "Registration failed");
                                        } catch (e: any) {
                                            alert("Registration Error: " + e.message);
                                        }
                                    }}
                                    className="px-8 py-3.5 bg-teal-500/20 hover:bg-teal-500 border border-teal-500/30 hover:border-teal-400 text-teal-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shrink-0 group"
                                >
                                    <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
                                    Register Callbacks
                                </button>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[8px] text-amber-600/80 font-bold uppercase tracking-tighter leading-relaxed">
                                    Ensure your <code className="text-amber-500 bg-amber-500/10 px-1 rounded">NEXT_PUBLIC_APP_URL</code> in <code className="text-amber-500 bg-amber-500/10 px-1 rounded">.env</code> is set to your public Ngrok/Live URL before registering.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-3 px-12 py-5 premium-gradient text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(13,148,136,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Deploy Configuration
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : activeTab === "bulk" ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
                    <div className="glass-card p-10 border-teal-500/10 bg-teal-500/[0.01]">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bulk <span className="text-teal-500">Logistics</span></h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Inventory Data Ingestion Matrix</p>
                            </div>
                            <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                                <Building2 className="w-6 h-6 text-teal-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-950/50 border border-white/5 rounded-3xl space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <FileSpreadsheet className="w-12 h-12 text-teal-500" />
                                    </div>
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                                        Standard Template Format (CSV/XLSX)
                                    </h4>

                                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-3 relative z-10">
                                        <div className="grid grid-cols-4 gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                                            <span>STOCK</span>
                                            <span>ITEM</span>
                                            <span>BUYING PRICE</span>
                                            <span>SELLING PRICE</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-4">
                                        <input
                                            type="file"
                                            id="excelUpload"
                                            accept=".csv,.xlsx,.xls"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const reader = new FileReader();
                                                reader.onload = async (evt) => {
                                                    try {
                                                        const bstr = evt.target?.result;
                                                        const wb = XLSX.read(bstr, { type: 'binary' });
                                                        const wsname = wb.SheetNames[0];
                                                        const ws = wb.Sheets[wsname];
                                                        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                                                        // Map headers manually or skip header row
                                                        const rows = data.slice(1) as any[];
                                                        const items = rows.filter(r => r.length >= 2).map(r => ({
                                                            stock: r[0],
                                                            name: r[1],
                                                            costPrice: r[2],
                                                            price: r[3],
                                                            category: "General",
                                                            unit: "pcs"
                                                        }));

                                                        if (items.length === 0) throw new Error("No valid data rows found in file.");

                                                        const currentInput = document.getElementById("bulkInput") as HTMLTextAreaElement;
                                                        currentInput.value = items.map(i => `${i.stock}, ${i.name}, ${i.costPrice}, ${i.price}`).join("\n");
                                                        alert(`File Loaded: ${items.length} rows parsed into the matrix.`);
                                                    } catch (err: any) {
                                                        alert("File Parse Error: " + err.message);
                                                    }
                                                };
                                                reader.readAsBinaryString(file);
                                            }}
                                        />

                                        <button
                                            onClick={() => document.getElementById("excelUpload")?.click()}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-500/20 transition-all shadow-lg shadow-teal-500/5 group"
                                        >
                                            <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                            Upload Excel or CSV
                                        </button>

                                        <a
                                            href="/stock_template.csv"
                                            download
                                            className="flex items-center justify-center gap-2 text-[8px] font-black text-slate-600 hover:text-teal-400 uppercase tracking-widest transition-all mt-2"
                                        >
                                            <FileText className="w-3 h-3" />
                                            Download Template (.csv)
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <textarea
                                    placeholder="Paste bulk data here (e.g. 50, Cement, 750, 900)"
                                    className="w-full h-[280px] bg-slate-950 border border-white/5 rounded-3xl p-6 text-[12px] font-mono text-white focus:outline-none focus:border-teal-500/30 transition-all placeholder:text-slate-800"
                                    id="bulkInput"
                                ></textarea>

                                <button
                                    onClick={async () => {
                                        const text = (document.getElementById("bulkInput") as HTMLTextAreaElement).value;
                                        if (!text.trim()) return alert("Matrix Data Missing: Please paste stock data.");

                                        const lines = text.trim().split("\n");
                                        const items = lines.map(line => {
                                            const parts = line.split(",").map(p => p.trim());
                                            return {
                                                stock: parts[0],
                                                name: parts[1],
                                                costPrice: parts[2],
                                                price: parts[3],
                                                category: "General",
                                                unit: "pcs"
                                            };
                                        });

                                        try {
                                            const res = await fetch("/api/products/bulk", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ items })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`Protocol Success: Synchronized ${data.count} items into Inventory.`);
                                                (document.getElementById("bulkInput") as HTMLTextAreaElement).value = "";
                                            } else throw new Error(data.error);
                                        } catch (e: any) {
                                            alert("Ingestion Error: " + e.message);
                                        }
                                    }}
                                    className="w-full py-5 premium-gradient text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Building2 className="w-5 h-5" />
                                    Synchronize with Inventory
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="glass-card p-12 border-rose-500/20 bg-rose-500/[0.02] text-center border-dashed">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                            <RotateCcw className="w-10 h-10 text-rose-500 animate-spin-slow" />
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">Initial State <span className="text-rose-500">Recovery</span></h3>
                        <p className="text-slate-500 text-xs font-medium max-w-md mx-auto leading-relaxed mb-10">
                            This operation will purge all transactional data including sales history, procurement logs, and expense records. Dashboard metrics will be synchronized to zero. <span className="text-rose-400 font-bold italic">This action is irreversible.</span>
                        </p>

                        <form onSubmit={handleReset} className="max-w-xs mx-auto space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Confirmation Required</label>
                                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">Security Key: RESET</span>
                                </div>
                                <input
                                    required
                                    placeholder="TYPE 'RESET' TO CONFIRM"
                                    className="w-full bg-slate-950 border border-rose-500/20 rounded-xl py-4 px-5 text-center text-sm font-black text-rose-500 placeholder:text-rose-500/20 focus:outline-none focus:border-rose-500 transition-all uppercase tracking-widest"
                                    value={resetConfirmation}
                                    onChange={e => setResetConfirmation(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isResetting || resetConfirmation !== "RESET"}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-900 disabled:text-slate-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-500/10 active:scale-95"
                            >
                                {isResetting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Purging Data...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-5 h-5" />
                                        Execute System Reset
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
