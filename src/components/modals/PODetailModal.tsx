"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import {
    Package,
    CreditCard,
    History,
    Plus,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Hash,
    User,
    ArrowRightLeft,
    Printer,
    Download,
    Eye,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateGRNReport } from "@/lib/pdf-service";

interface PODetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    po: any;
    vendor: any;
}

export default function PODetailModal({ isOpen, onClose, po, vendor }: PODetailModalProps) {
    const { addPOPayment, products, config } = useApp();
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [reference, setReference] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    if (!po) return null;

    const items = JSON.parse(po.items || "[]");
    const transactions = po.transactions || [];
    const balance = po.total - (po.paidAmount || 0);
    const isFullyPaid = balance <= 0;

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        setIsSubmitting(true);
        try {
            await addPOPayment(po.id, {
                amount: parseFloat(amount),
                method: paymentMethod,
                reference
            });
            setAmount("");
            setReference("");
            setShowPaymentForm(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGRNAction = (action: 'print' | 'download' | 'open') => {
        const urlOrResult = generateGRNReport(po, vendor, products, action, config);
        if (action === 'open' && typeof urlOrResult === 'string') {
            window.open(urlOrResult, '_blank');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manifest Analysis: ${po.poNumber}`}>
            <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">

                {/* GRN Toolset */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Goods Received Note</h3>
                            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Physical Inventory Reconciliation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleGRNAction('open')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-300 text-[8px] font-black uppercase tracking-widest hover:text-teal-400 hover:border-teal-500/20 transition-all font-bold"
                        >
                            <Eye size={12} />
                            Preview
                        </button>
                        <button
                            onClick={() => handleGRNAction('print')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-300 text-[8px] font-black uppercase tracking-widest hover:text-teal-400 hover:border-teal-500/20 transition-all font-bold"
                        >
                            <Printer size={12} />
                            Print
                        </button>
                        <button
                            onClick={() => handleGRNAction('download')}
                            className="flex items-center gap-2 px-6 py-2 premium-gradient text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all font-bold"
                        >
                            <Download size={12} />
                            Download GRN
                        </button>
                    </div>
                </div>

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-4 border-white/5 bg-white/[0.02]">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Payload</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">KES {po.total.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-4 border-white/5 bg-white/[0.02]">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Settled Volume</p>
                        <p className="text-xl font-black text-emerald-500 italic tracking-tighter">KES {(po.paidAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-4 border-white/5 bg-white/[0.02]">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Active Liability</p>
                        <p className={`text-xl font-black italic tracking-tighter ${balance > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                            KES {balance.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-950/40 border border-white/5 rounded-2xl">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                                <User size={16} />
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Supply Partner</p>
                                <p className="text-xs font-bold text-slate-200">{vendor?.name || "System Core"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                                <Calendar size={16} />
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Manifest Date</p>
                                <p className="text-xs font-bold text-slate-200">{new Date(po.date).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                                <ArrowRightLeft size={16} />
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Protocol Type</p>
                                <p className={`text-xs font-bold uppercase ${po.paymentMethod === 'Cash' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {po.paymentMethod === 'Cash' ? 'Immediate Settlement' : 'Credit Account'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Operational Status</p>
                                <p className={`text-xs font-bold uppercase ${po.status === 'Delivered' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                                    {po.status}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Package className="w-4 h-4 text-teal-500" />
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Inventory Payload</h4>
                    </div>
                    <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-500">SKU Description</th>
                                    <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-500 text-center">Qty</th>
                                    <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-500 text-right">Unit Cost</th>
                                    <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-500 text-right">Line Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {items.map((item: any, i: number) => {
                                    const product = products.find(p => p.id === item.productId);
                                    return (
                                        <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-4 py-3 text-[10px] font-bold text-slate-300">{product?.name || "Unknown SKU"}</td>
                                            <td className="px-4 py-3 text-[10px] font-black text-white text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-[10px] font-mono text-slate-400 text-right">KES {item.costPrice.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-[10px] font-black text-teal-500 text-right">KES {(item.quantity * item.costPrice).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment History */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-teal-500" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Settlement Ledger</h4>
                        </div>
                        {!isFullyPaid && po.paymentMethod === 'Credit' && (
                            <button
                                onClick={() => setShowPaymentForm(!showPaymentForm)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg text-teal-400 text-[8px] font-black uppercase tracking-widest transition-all"
                            >
                                <Plus className="w-2.5 h-2.5" />
                                Record Injection
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showPaymentForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <form onSubmit={handleAddPayment} className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black uppercase tracking-widest text-teal-500/50">Amount</label>
                                            <input
                                                type="number"
                                                required
                                                max={balance}
                                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs font-black text-white outline-none focus:border-teal-500/30"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black uppercase tracking-widest text-teal-500/50">Method</label>
                                            <select
                                                title="Payment Method"
                                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs font-bold text-white outline-none focus:border-teal-500/30 appearance-none"
                                                value={paymentMethod}
                                                onChange={e => setPaymentMethod(e.target.value)}
                                            >
                                                <option>Cash</option>
                                                <option>Mpesa</option>
                                                <option>Bank Transfer</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black uppercase tracking-widest text-teal-500/50">Reference</label>
                                            <input
                                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs font-bold text-white outline-none focus:border-teal-500/30"
                                                placeholder="REF_ID..."
                                                value={reference}
                                                onChange={e => setReference(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 premium-gradient text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Processing..." : "Authorize Payment"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        {transactions.length === 0 ? (
                            <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl opacity-40">
                                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                <p className="text-[8px] font-black uppercase tracking-widest">No settlement history detected</p>
                            </div>
                        ) : transactions.map((tx: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl group hover:border-teal-500/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-black text-white italic tracking-tighter">KES {tx.amount.toLocaleString()}</p>
                                            <span className="text-[7px] px-1.5 py-0.5 bg-white/5 text-slate-500 rounded font-black uppercase tracking-widest">{tx.method}</span>
                                        </div>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Ref: {tx.reference || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                                    <p className="text-[7px] text-slate-700 font-bold uppercase tracking-widest mt-0.5">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="pt-4 border-t border-white/5">
                    <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest text-center leading-relaxed">
                        Security Notice: All procurement injections are immutable once authorized. Ensure payload validation before deployment.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
