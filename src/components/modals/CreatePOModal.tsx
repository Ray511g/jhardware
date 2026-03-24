"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Trash2, Plus, ShoppingBag, TrendingUp } from "lucide-react";

interface CreatePOModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatePOModal({ isOpen, onClose }: CreatePOModalProps) {
    const { vendors, products, addPO } = useApp();
    const [vendorId, setVendorId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Credit");
    const [items, setItems] = useState<{ productId: string, quantity: number, costPrice: number }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addItem = () => {
        setItems([...items, { productId: "", quantity: 0, costPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;

        // Auto-fill cost price if product is selected
        if (field === "productId") {
            const product = products.find(p => p.id === value);
            if (product) newItems[index].costPrice = product.costPrice;
        }

        setItems(newItems);
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorId || items.length === 0) return;

        setIsSubmitting(true);
        try {
            const poNumber = `PO-${Date.now().toString().slice(-6)}`;
            await addPO({
                poNumber,
                vendorId,
                total,
                items,
                status: "Pending",
                paymentMethod
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Initialize Procurement Manifest">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label htmlFor="vendorSelect" className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-1">Strategic Supply Partner</label>
                        <select
                            id="vendorSelect"
                            required
                            title="Select Supply Partner"
                            className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-[11px] text-slate-200 focus:border-teal-500/30 transition-all outline-none appearance-none font-bold"
                            value={vendorId}
                            onChange={e => setVendorId(e.target.value)}
                        >
                            <option value="">Choose Supplier...</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="paymentMethod" className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-1">Account Protocol</label>
                        <select
                            id="paymentMethod"
                            required
                            title="Select Account Protocol"
                            className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-[11px] text-slate-200 focus:border-teal-500/30 transition-all outline-none appearance-none font-bold"
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                        >
                            <option value="Credit">CREDIT ACCOUNT (DEBT)</option>
                            <option value="Cash">INSTANT CASH (SETTLED)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-teal-500" />
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-teal-500/20 underline-offset-4">Manifest Inventory</label>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            title="Add item to manifest"
                            className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg text-teal-400 text-[8px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-2.5 h-2.5" />
                            Expand Scope
                        </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 scrollbar-teal">
                        {items.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-slate-950/20">
                                <Plus className="w-8 h-8 text-slate-800 mx-auto mb-2 opacity-20" />
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-700">Scope empty - Initialize manifest</p>
                            </div>
                        ) : items.map((item, index) => (
                            <div key={index} className="flex gap-4 p-3 bg-slate-900/40 border border-white/5 rounded-xl group hover:border-teal-500/20 transition-all">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="text-[7px] font-black uppercase tracking-widest text-slate-700 mb-1 block ml-1">SKU Identification</label>
                                        <select
                                            aria-label="Select Product"
                                            title="Select Product SKU"
                                            className="w-full bg-slate-950 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 py-2 px-3 outline-none appearance-none focus:border-teal-500/20"
                                            value={item.productId}
                                            onChange={e => updateItem(index, "productId", e.target.value)}
                                        >
                                            <option value="">Select SKU...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[7px] font-black uppercase tracking-widest text-slate-700 mb-1 block ml-1">Quantity</label>
                                        <input
                                            type="number"
                                            aria-label="Quantity"
                                            title="Quantity"
                                            placeholder="0"
                                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-[10px] font-black text-slate-200 outline-none focus:border-teal-500/20"
                                            value={item.quantity || ""}
                                            onChange={e => updateItem(index, "quantity", parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[7px] font-black uppercase tracking-widest text-slate-700 mb-1 block ml-1">Landing Cost (KES)</label>
                                        <input
                                            type="number"
                                            aria-label="Landing Cost"
                                            title="Landing Cost"
                                            placeholder="0.00"
                                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-[10px] font-black text-teal-500 outline-none focus:border-teal-500/20 underline decoration-teal-500/10 underline-offset-2"
                                            value={item.costPrice || ""}
                                            onChange={e => updateItem(index, "costPrice", parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    title="Remove Item"
                                    className="p-2 self-end mb-1 bg-slate-950 hover:bg-rose-500/10 border border-white/5 rounded-lg text-slate-800 hover:text-rose-500 transition-all shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 mt-4 border-t border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-500/5 rounded-xl flex items-center justify-center text-teal-500 border border-teal-500/10">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[7px] text-slate-600 font-black uppercase tracking-[0.2em]">Total Payload Value</p>
                            <p className="text-xl font-black text-white italic tracking-tighter mt-0.5">KES {total.toLocaleString()}</p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        title="Finalize Manifest"
                        disabled={isSubmitting || items.length === 0}
                        className="px-8 py-3 premium-gradient rounded-xl font-black uppercase tracking-widest text-white shadow-xl shadow-teal-500/10 transition-all disabled:opacity-20 text-[10px] hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                    >
                        {isSubmitting ? "Matrix Syncing..." : (
                            <>
                                <Plus className="w-3.5 h-3.5" />
                                Deploy Manifest
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
