"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
    const { addProduct, fetchProducts } = useApp();
    const [formData, setFormData] = useState({
        name: "",
        category: "Cement",
        stock: 0,
        minStock: 10,
        price: 0,
        costPrice: 0,
        unit: "Bag"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addProduct(formData);
            await fetchProducts();
            setFormData({
                name: "",
                category: "Cement",
                stock: 0,
                minStock: 10,
                price: 0,
                costPrice: 0,
                unit: "Bag"
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New Hardware Item">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-left">
                    <div className="space-y-1 md:col-span-1">
                        <label htmlFor="productName" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Product Name</label>
                        <input
                            id="productName"
                            type="text"
                            required
                            className="bg-slate-950 border border-white/5 w-full rounded-lg py-2.5 px-3 text-[11px] text-slate-200 outline-none focus:border-teal-500/30 transition-all font-bold"
                            placeholder="e.g. Bamburi Tembo Cement"
                            title="Enter product name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="productCategory" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Category</label>
                        <select
                            id="productCategory"
                            title="Product Category"
                            className="bg-slate-950 border border-white/5 w-full rounded-lg py-2.5 px-3 text-[11px] text-slate-200 outline-none focus:border-teal-500/30 transition-all font-bold"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>Cement</option>
                            <option>Steel & Iron</option>
                            <option>Roofing</option>
                            <option>Plumbing</option>
                            <option>Electrical</option>
                            <option>Paint</option>
                            <option>Tools</option>
                            <option>Timber</option>
                            <option>Fasteners</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="productUnit" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Unit</label>
                        <select
                            id="productUnit"
                            title="Unit of Measure"
                            className="bg-slate-950 border border-white/5 w-full rounded-lg py-2.5 px-3 text-[11px] text-slate-200 outline-none focus:border-teal-500/30 transition-all font-bold"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                            <option>Bag</option>
                            <option>Kg</option>
                            <option>Piece</option>
                            <option>Metre</option>
                            <option>Roll</option>
                            <option>Litre</option>
                            <option>Ft</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="productCost" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Cost Price (KES)</label>
                        <input
                            id="productCost"
                            type="number"
                            required
                            title="Cost Price"
                            placeholder="0.00"
                            className="bg-slate-950 border border-white/5 w-full rounded-lg py-2.5 px-3 text-[11px] text-slate-400 outline-none focus:border-teal-500/30 transition-all font-bold"
                            value={formData.costPrice || ""}
                            onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="productPrice" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Selling Price (KES)</label>
                        <input
                            id="productPrice"
                            type="number"
                            required
                            title="Selling Price"
                            placeholder="0.00"
                            className="bg-slate-950 border border-white/5 w-full rounded-lg py-2.5 px-3 text-[11px] text-teal-400 outline-none focus:border-teal-500/30 transition-all font-black"
                            value={formData.price || ""}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="productStock" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Initial Stock</label>
                        <input
                            id="productStock"
                            type="number"
                            required
                            title="Initial Stock"
                            placeholder="0"
                            className="bg-slate-950 border border-white/5 w-full rounded-lg py-2.5 px-3 text-[11px] text-slate-200 outline-none focus:border-teal-500/30 transition-all font-bold"
                            value={formData.stock || ""}
                            onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 premium-gradient text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:opacity-20"
                    >
                        {isSubmitting ? "Syncing..." : "Add to Matrix"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
