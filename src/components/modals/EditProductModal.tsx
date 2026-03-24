"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
    const { updateProduct } = useApp();
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: 0,
        costPrice: 0,
        stock: 0,
        minStock: 10,
        unit: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                category: product.category || "",
                price: product.price || 0,
                costPrice: product.costPrice || 0,
                stock: product.stock || 0,
                minStock: product.minStock || 10,
                unit: product.unit || "Unit"
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product?.id) return;
        setIsSubmitting(true);
        try {
            await updateProduct(product.id, formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Hardware Profile">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1 md:col-span-1">
                        <label htmlFor="editName" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Product Name</label>
                        <input
                            id="editName"
                            required
                            title="Product Name"
                            placeholder="Enter product name"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-[11px] text-slate-200 focus:border-teal-500/30 transition-all outline-none font-bold"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="editCategory" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Category</label>
                        <select
                            id="editCategory"
                            title="Product Category"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-[11px] text-slate-200 focus:border-teal-500/30 transition-all outline-none font-bold"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Cement">Cement</option>
                            <option value="Steel & Iron">Steel & Iron</option>
                            <option value="Roofing">Roofing</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Paint">Paint</option>
                            <option value="Timber">Timber</option>
                            <option value="Fasteners">Fasteners</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="editUnit" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Unit of Measure</label>
                        <select
                            id="editUnit"
                            title="Unit of Measure"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-[11px] text-slate-200 focus:border-teal-500/30 transition-all outline-none font-bold"
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
                        <label htmlFor="editCostPrice" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Cost Price (KES)</label>
                        <input
                            id="editCostPrice"
                            type="number"
                            required
                            title="Cost Price"
                            placeholder="0.00"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-[11px] text-slate-200 outline-none font-bold"
                            value={formData.costPrice}
                            onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="editRetailPrice" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Retail Price (KES)</label>
                        <input
                            id="editRetailPrice"
                            type="number"
                            required
                            title="Retail Price"
                            placeholder="0.00"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-[11px] text-teal-400 outline-none font-bold"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="editStock" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Current Stock</label>
                        <input
                            id="editStock"
                            type="number"
                            required
                            title="Current Stock"
                            placeholder="0"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-[11px] text-slate-200 outline-none font-bold"
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="editMinStock" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Low Stock Threshold</label>
                        <input
                            id="editMinStock"
                            type="number"
                            required
                            title="Low Stock Threshold"
                            placeholder="0"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-[11px] text-slate-200 outline-none font-bold"
                            value={formData.minStock}
                            onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
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
                        {isSubmitting ? "Updating..." : "Commit Update"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
