"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import {
    CreditCard,
    History,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    FileText,
    Wallet,
    Plus
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ContractorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractor: any;
}

export default function ContractorDetailModal({ isOpen, onClose, contractor }: ContractorDetailModalProps) {
    const { addContractorTransaction } = useApp();
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!contractor) return null;

    const handlePayment = async (type: "Credit" | "Payment") => {
        if (!amount || isNaN(Number(amount))) return;

        setIsProcessing(true);
        await addContractorTransaction({
            contractorId: contractor.id,
            amount: Number(amount),
            type,
            reference: reference || (type === "Payment" ? "Debt Settlement" : "Service Credit")
        });
        setIsProcessing(false);
        setAmount("");
        setReference("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ledger account: ${contractor.name}`}>
            <div className="p-6 space-y-8">
                {/* Stats Header */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 border-white/[0.03] bg-white/[0.01]">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Contract Balance</p>
                        <h4 className="text-xl font-black text-white italic tracking-tighter">KES {contractor.balance.toLocaleString()}</h4>
                    </div>
                    <div className="glass-card p-4 border-teal-500/10 bg-teal-500/5">
                        <p className="text-teal-500/70 text-[9px] font-black uppercase tracking-widest mb-1">Account Standing</p>
                        <h4 className="text-xl font-black text-teal-400 italic tracking-tighter">T1 Verified</h4>
                    </div>
                </div>

                {/* Transaction Form */}
                <div className="glass-card p-5 border-white/[0.05] bg-black/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-amber-500" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjust Ledger Balance</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Amount (KES)"
                            className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:border-amber-500/30 transition-all"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Reference / Notes"
                            className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:border-amber-500/30 transition-all"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => handlePayment("Payment")}
                            disabled={isProcessing || !amount}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/10"
                        >
                            <ArrowDownLeft className="w-4 h-4" />
                            Record Payment
                        </button>
                        <button
                            onClick={() => handlePayment("Credit")}
                            disabled={isProcessing || !amount}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/10"
                        >
                            <Plus className="w-4 h-4" />
                            Add Credit
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <History className="w-4 h-4 text-teal-500" />
                            Transmission History
                        </h4>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{contractor.transactions?.length || 0} Entries</span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {contractor.transactions?.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl">
                                <FileText className="w-8 h-8 text-slate-800 mx-auto mb-2 opacity-20" />
                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">No ledger entries detected</p>
                            </div>
                        ) : contractor.transactions?.map((tx: any, i: number) => (
                            <div key={i} className="glass-card p-4 border-white/[0.03] bg-white/[0.01] flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'Payment' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {tx.type === 'Payment' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-tighter">{tx.reference || tx.type}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-2.5 h-2.5 text-slate-600" />
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">
                                                {new Date(tx.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black italic tracking-tighter ${tx.type === 'Payment' ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                        {tx.type === 'Payment' ? '-' : '+'} KES {tx.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )).reverse()}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
