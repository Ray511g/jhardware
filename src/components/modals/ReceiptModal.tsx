"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { Printer, X, CheckCircle2, FileText, ExternalLink } from "lucide-react";

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    pdfUrl: string;
}

export default function ReceiptModal({ isOpen, onClose, order, pdfUrl }: ReceiptModalProps) {
    if (!order) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Receipt Verification">
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Success</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Order: {order.orderNumber || order.id.slice(0, 12)}</p>
                </div>

                {/* Instant Preview Engine */}
                <div className="w-full h-[400px] bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden relative">
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-none"
                        title="Receipt Preview"
                    />
                </div>

                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={() => {
                            const iframe = document.querySelector('iframe');
                            if (iframe && iframe.contentWindow) {
                                iframe.contentWindow.print();
                            }
                        }}
                        className="flex items-center justify-center gap-3 p-4 bg-teal-500 text-white rounded-xl hover:brightness-110 transition-all group shadow-lg shadow-teal-500/20"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Print Now</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Dismiss</span>
                    </button>
                </div>

                <div className="w-full bg-slate-950/30 border border-white/[0.02] p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Inventory Synchronized</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50 italic">Fast-Path Execution</span>
                </div>
            </div>
        </Modal>
    );
}
