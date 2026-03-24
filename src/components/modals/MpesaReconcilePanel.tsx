"use client";

import React, { useState, useCallback } from "react";
import {
    Smartphone, Search, RefreshCw, CheckCircle2,
    Clock, AlertCircle, ChevronDown, ChevronUp, Plus, AlertTriangle, ShieldAlert, Info, ExternalLink, Zap
} from "lucide-react";

interface MpesaPayment {
    id: string;
    transactionCode: string;
    phone: string;
    amount: number;
    firstName?: string;
    lastName?: string;
    transactedAt: string;
    status: string;
}

interface Props {
    total: number;
    onConfirm: (ref: string, paymentId?: string) => void;
    confirmedRef: string;
}

export default function MpesaReconcilePanel({ total, onConfirm, confirmedRef }: Props) {
    const [payments, setPayments] = useState<MpesaPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [manualPhone, setManualPhone] = useState("");
    const [manualAmount, setManualAmount] = useState("");
    const [addingManual, setAddingManual] = useState(false);
    const [showManualForm, setShowManualForm] = useState(true); // open by default
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const [pendingPayment, setPendingPayment] = useState<MpesaPayment | null>(null);
    const [showAutoSection, setShowAutoSection] = useState(false);
    const [stkLoading, setStkLoading] = useState(false);
    const [stkStatus, setStkStatus] = useState<"idle" | "sent" | "success" | "error">("idle");
    const [checkoutId, setCheckoutId] = useState("");

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/mpesa/payments?minutes=120`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setPayments(data.payments || []);
            setSearched(true);
        } catch (e: any) {
            setError(e.message || "Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    }, []);

    const getAmountStatus = (paidAmount: number) => {
        const diff = paidAmount - total;
        const pct = Math.abs(diff) / total * 100;
        if (paidAmount >= total) return { ok: true, label: "EXACT / OVERPAID", color: "emerald", diff };
        if (pct <= 2) return { ok: true, label: "WITHIN TOLERANCE (≤2%)", color: "teal", diff };
        return { ok: false, label: `SHORT KES ${Math.abs(diff).toFixed(2)}`, color: pct <= 10 ? "amber" : "rose", diff };
    };

    const handleSelectPayment = (payment: MpesaPayment) => {
        const status = getAmountStatus(payment.amount);
        if (!status.ok) {
            setPendingPayment(payment);
        } else {
            onConfirm(payment.transactionCode, payment.id);
        }
    };

    const handleForcePending = () => {
        if (pendingPayment) {
            onConfirm(pendingPayment.transactionCode, pendingPayment.id);
            setPendingPayment(null);
        }
    };

    const handleAddManual = async () => {
        if (!manualCode.trim()) {
            return;
        }
        const enteredAmount = parseFloat(manualAmount) || total;
        const status = getAmountStatus(enteredAmount);

        if (!status.ok && !window.confirm(
            `WARNING: Payment KES ${enteredAmount.toLocaleString()} does not match bill of KES ${total.toLocaleString()}.\n\nShortfall: KES ${Math.abs(status.diff).toFixed(2)}\n\nAccept this underpayment?`
        )) return;

        setAddingManual(true);
        setError("");
        try {
            const res = await fetch("/api/mpesa/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionCode: manualCode.trim().toUpperCase(),
                    phone: manualPhone.trim() || "Unknown",
                    amount: enteredAmount
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            onConfirm(data.payment.transactionCode, data.payment.id);
            setShowManualForm(false);
            setManualCode(""); setManualPhone(""); setManualAmount("");
        } catch (e: any) {
            setError(e.message || "Failed to add payment");
        } finally {
            setAddingManual(false);
        }
    };

    const handleStkPush = async () => {
        if (!manualPhone.trim()) return setError("Enter phone number");
        setStkLoading(true);
        setStkStatus("sent");
        setError("");
        try {
            const res = await fetch("/api/mpesa/stkpush", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: manualPhone,
                    amount: parseFloat(manualAmount) || total,
                    reference: "BIASHARA POS"
                })
            });
            const data = await res.json();
            if (data.success) {
                setCheckoutId(data.CheckoutRequestID);
                // Notification check
                setTimeout(fetchPayments, 10000);
            } else throw new Error(data.message || "Failed to send prompt");
        } catch (e: any) {
            setStkStatus("error");
            setError(e.message);
        } finally {
            setStkLoading(false);
        }
    };

    const formatPhone = (phone: string) => phone.startsWith("254") ? "0" + phone.slice(3) : phone;
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: true });

    // ── Confirmed state ──────────────────────────────────────────────────────
    if (confirmedRef) {
        return (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                        <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Payment Reconciled</div>
                        <div className="text-[11px] font-black text-white font-mono">{confirmedRef}</div>
                    </div>
                    <button onClick={() => onConfirm("", undefined)} className="ml-auto text-[7px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-colors">
                        Change
                    </button>
                </div>
            </div>
        );
    }

    // ── Amount mismatch screen ──────────────────────────────────────────────
    if (pendingPayment) {
        const status = getAmountStatus(pendingPayment.amount);
        return (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Amount Mismatch — Confirm Override</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px]"><span className="text-slate-500 font-bold">Bill Amount</span><span className="font-black text-white">KES {total.toLocaleString()}</span></div>
                        <div className="flex justify-between text-[9px]"><span className="text-slate-500 font-bold">Payment Received</span><span className="font-black text-amber-400">KES {pendingPayment.amount.toLocaleString()}</span></div>
                        <div className="flex justify-between text-[9px] border-t border-white/5 pt-1"><span className="text-slate-500 font-bold">Shortfall</span><span className="font-black text-rose-400">KES {Math.abs(status.diff).toFixed(2)}</span></div>
                    </div>
                    <div className="text-[8px] text-amber-300 font-bold uppercase tracking-widest">{pendingPayment.transactionCode} • {formatPhone(pendingPayment.phone)}</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setPendingPayment(null)} className="py-2.5 border border-white/10 rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-widest transition-all">Cancel</button>
                        <button onClick={handleForcePending} className="py-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-[8px] font-black text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Accept Anyway
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main panel ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">

            {/* Header */}
            <div className="flex items-center gap-2">
                <Smartphone className="w-3 h-3 text-teal-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">M-Pesa — Till 5274604</span>
            </div>

            {/* Bill amount */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-white/5 rounded-xl">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Expected</span>
                <span className="text-[14px] font-black text-teal-400 italic">KES {total.toLocaleString()}</span>
            </div>

            {/* ── PRIMARY: STK Push Prompt ── */}
            <div className="space-y-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Smartphone className="w-12 h-12 text-teal-500" />
                </div>

                <div className="space-y-1 relative z-10">
                    <div className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Direct Payment Prompt
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Customer Phone (e.g. 0712345678)"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-black text-white focus:outline-none focus:border-teal-500/50 transition-all tracking-wider font-mono placeholder-slate-700"
                            value={manualPhone}
                            onChange={(e) => setManualPhone(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <input
                                type="number"
                                placeholder={`Amount (KES ${total.toLocaleString()})`}
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-3 text-[10px] font-bold text-slate-400 focus:outline-none focus:border-teal-500/30 transition-all"
                                value={manualAmount}
                                onChange={(e) => setManualAmount(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleStkPush}
                            disabled={stkLoading || !manualPhone}
                            className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-xl ${stkStatus === "sent"
                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                : "bg-teal-500 text-white hover:bg-teal-400 active:scale-95"
                                }`}
                        >
                            {stkLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Smartphone className="w-3 h-3" />}
                            {stkLoading ? "Sending..." : stkStatus === "sent" ? "Requesting..." : "Send Prompt"}
                        </button>
                    </div>

                    {stkStatus === "sent" && (
                        <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <p className="text-[7px] text-amber-500 font-bold uppercase tracking-widest leading-relaxed">
                                Prompt sent to phone. Waiting for PIN...
                            </p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-2 relative z-10">
                        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="text-[7px] text-rose-400 font-bold uppercase tracking-tighter">{error}</span>
                    </div>
                )}
            </div>

            {/* ── SECONDARY: Manual Code Entry ── */}
            <div className="space-y-2 bg-slate-900/50 border border-white/5 rounded-xl p-3">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 items-center flex justify-between">
                    Customer SMS Entry
                    {manualCode && <button onClick={() => setManualCode("")} className="text-rose-500">Reset</button>}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="M-PESA CODE"
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-[10px] font-black text-white focus:outline-none focus:border-teal-500/30 transition-all font-mono placeholder-slate-800 uppercase"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    />
                    <button
                        onClick={handleAddManual}
                        disabled={!manualCode.trim() || addingManual}
                        className="px-6 py-2.5 border border-white/10 rounded-xl text-[8px] font-black text-slate-500 hover:text-teal-400 transition-all uppercase tracking-widest"
                    >
                        {addingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                    </button>
                </div>
            </div>

            {/* ── SECONDARY: Auto-search (requires callback registration) ── */}
            <button
                onClick={() => setShowAutoSection(!showAutoSection)}
                className="w-full flex items-center justify-between px-3 py-2 border border-white/5 rounded-xl text-slate-600 hover:text-slate-400 transition-all"
            >
                <div className="flex items-center gap-2">
                    <Search className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Auto-Search Payments</span>
                    <span className="text-[6px] font-black bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded uppercase tracking-widest">Requires Setup</span>
                </div>
                {showAutoSection ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showAutoSection && (
                <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                    {/* Setup notice */}
                    <div className="flex items-start gap-2 p-3 bg-slate-900 border border-amber-500/20 rounded-xl">
                        <Info className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[7px] text-slate-500 font-bold leading-relaxed">
                            Auto-search requires <span className="text-amber-400">Safaricom C2B registration</span> with a public server URL. Until registered, the list will always be empty — use the manual code entry above.
                        </div>
                    </div>

                    <button
                        onClick={fetchPayments}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-white/5 hover:border-teal-500/20 rounded-xl transition-all text-slate-500 hover:text-teal-400 font-black text-[9px] uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        {loading ? "Searching..." : "Search Database"}
                    </button>

                    {searched && !loading && (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                            {payments.length === 0 ? (
                                <div className="text-center py-3 text-slate-600 text-[8px] font-black uppercase tracking-widest">
                                    No payments in database — register callback to enable
                                </div>
                            ) : payments.map((p) => {
                                const amtStatus = getAmountStatus(p.amount);
                                return (
                                    <button key={p.id} onClick={() => handleSelectPayment(p)}
                                        className={`w-full flex items-center gap-3 p-2.5 bg-slate-950 border rounded-xl transition-all text-left group ${amtStatus.ok ? "border-white/5 hover:border-teal-500/30" : "border-amber-500/20 hover:border-amber-500/40"}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono text-[10px] font-black text-white">{p.transactionCode}</div>
                                            <div className="text-[7px] text-slate-500">{formatPhone(p.phone)} • {formatTime(p.transactedAt)}</div>
                                        </div>
                                        <div className={`text-[11px] font-black ${amtStatus.ok ? "text-teal-400" : "text-amber-400"}`}>
                                            KES {p.amount.toLocaleString()}
                                        </div>
                                        {amtStatus.ok
                                            ? <CheckCircle2 className="w-4 h-4 text-slate-700 group-hover:text-teal-500 shrink-0" />
                                            : <AlertTriangle className="w-4 h-4 text-amber-500/50 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
