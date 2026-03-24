"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { Printer, Download, FileText } from "lucide-react";
import { generatePOPDF } from "@/lib/pdf-service";
import { useApp } from "@/context/AppContext";

interface PrintPOModalProps {
    isOpen: boolean;
    onClose: () => void;
    po: any;
    vendor: any;
    products: any[];
}

export default function PrintPOModal({ isOpen, onClose, po, vendor, products }: PrintPOModalProps) {
    const { config } = useApp();
    if (!po) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manifest Output Options">
            <div className="p-4 space-y-8">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 border border-teal-500/20 shadow-xl shadow-teal-500/5">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Document Dispatch</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Manifest: {po.poNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => {
                            generatePOPDF(po, vendor, products, 'print', config);
                            // We don't call onClose() immediately to avoid interrupting the print dialog
                        }}
                        className="group flex flex-col items-center justify-center p-8 bg-slate-900/50 hover:bg-teal-500 border border-white/5 hover:border-teal-400 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl"
                    >
                        <Printer className="w-10 h-10 mb-4 text-teal-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Print Document</span>
                        <p className="text-[8px] text-slate-600 group-hover:text-teal-100 mt-2 font-bold transition-colors">Direct to system printer</p>
                    </button>

                    <button
                        onClick={() => {
                            generatePOPDF(po, vendor, products, 'download', config);
                            onClose();
                        }}
                        className="group flex flex-col items-center justify-center p-8 bg-slate-900/50 hover:bg-emerald-500 border border-white/5 hover:border-emerald-400 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl"
                    >
                        <Download className="w-10 h-10 mb-4 text-emerald-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Download PDF</span>
                        <p className="text-[8px] text-slate-600 group-hover:text-emerald-100 mt-2 font-bold transition-colors">Internal storage archive</p>
                    </button>
                </div>

                <div className="p-4 bg-black/20 rounded-xl border border-white/[0.03]">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        <span>Output Sync Status</span>
                        <span className="text-teal-500">Encrypted</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-teal-500 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
