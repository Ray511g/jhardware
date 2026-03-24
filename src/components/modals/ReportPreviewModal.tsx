"use client";

import React from "react";
import { X, Download, Printer, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string | null;
    title: string;
}

export default function ReportPreviewModal({ isOpen, onClose, pdfUrl, title }: ReportPreviewModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-6xl h-full bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
                                <Printer className="w-5 h-5 text-teal-500" />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-sm">{title}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Live Intel Preview Module</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                                <Share2 className="w-4 h-4 text-slate-400 group-hover:text-white" />
                            </button>
                            <a
                                href={pdfUrl || "#"}
                                download={`${title.replace(/\s+/g, '_')}.pdf`}
                                className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/20"
                            >
                                <Download className="w-4 h-4" />
                                Save Document
                            </a>
                            <button
                                onClick={onClose}
                                className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* PDF Preview Area */}
                    <div className="flex-1 bg-slate-950 relative">
                        {pdfUrl ? (
                            <iframe
                                src={`${pdfUrl}#toolbar=0&view=FitH`}
                                className="w-full h-full border-none"
                                title="Report Preview"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                                <div className="w-16 h-16 border-4 border-slate-800 border-t-teal-500 rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing Data...</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="px-8 py-4 bg-slate-900/80 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">
                        <span>Enterprise Cluster: P0-SYSTEM-ALPHA</span>
                        <span>Security: RSA-4096 Encrypted</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
