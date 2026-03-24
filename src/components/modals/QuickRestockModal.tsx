"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Package, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface QuickRestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
}

export default function QuickRestockModal({ isOpen, onClose, product }: QuickRestockModalProps) {
    const { updateProduct } = useApp();
    const [quantity, setQuantity] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) return;
        
        setIsSubmitting(true);
        try {
            // Update stock by incrementing current stock
            await updateProduct(product.id, {
                stock: product.stock + quantity
            });
            setQuantity(0);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Inventory Injection">
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
                <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20">
                    <Package className="w-8 h-8 text-teal-500" />
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">{product.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Current Balance: {product.stock} {product.unit}s</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl space-y-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-1">Quantity to Inject</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="0"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-2xl font-black text-teal-400 focus:border-teal-500/50 transition-all outline-none text-center"
                                    value={quantity || ""}
                                    onChange={e => setQuantity(parseFloat(e.target.value))}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                                    {product.unit}s
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Projected Total</p>
                            <p className="text-sm font-black text-white">{(product.stock + quantity).toLocaleString()} {product.unit}s</p>
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting || quantity <= 0}
                        className="w-full py-4 premium-gradient text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg flex items-center justify-center gap-3 hover:scale-[1.01] transition-all disabled:opacity-20"
                    >
                        {isSubmitting ? "SYNCING..." : (
                            <>
                                <ArrowUpRight className="w-4 h-4" />
                                Confirm Stock Injection
                            </>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </Modal>
    );
}
