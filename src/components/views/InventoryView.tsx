"use client";

import React, { useState, useMemo } from "react";
import {
    Package,
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    ArrowUpRight,
    AlertTriangle,
    CheckCircle2,
    BarChart3
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AddProductModal from "../modals/AddProductModal";
import EditProductModal from "../modals/EditProductModal";
import QuickRestockModal from "../modals/QuickRestockModal";

export default function InventoryView() {
    const { products, deleteProduct } = useApp();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Strict Permissions Matrix
    const hasFullPower = user?.role === "Admin";
    const canView = hasFullPower || user?.permissions?.includes("inventory_view") || user?.permissions?.includes("inventory_edit");
    const canEdit = hasFullPower || user?.permissions?.includes("inventory_edit");
    const canDelete = hasFullPower || user?.permissions?.includes("inventory_delete");

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in">
                <AlertTriangle className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500">Access Restricted</h2>
                <p className="text-slate-500 mt-2 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks sufficient clearance for Inventory Matrix.</p>
            </div>
        );
    }

    const itemsPerPage = 10;
    const filteredItems = useMemo(() => products.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`SECURITY PROTOCOL: Are you sure you want to PERMANENTLY purge ${name} from the matrix?`)) {
            await deleteProduct(id);
        }
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setIsEditModalOpen(true);
    };

    const handleStock = (item: any) => {
        setSelectedItem(item);
        setIsStockModalOpen(true);
    };

    const inventoryValue = useMemo(() => products.reduce((acc, current) => acc + (current.stock * current.costPrice), 0), [products]);
    const lowStockCount = useMemo(() => products.filter(p => p.stock < p.minStock).length, [products]);

    return (
        <div className="space-y-8 animate-fade-in text-white">
            <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditProductModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedItem(null); }} product={selectedItem} />
            <QuickRestockModal isOpen={isStockModalOpen} onClose={() => { setIsStockModalOpen(false); setSelectedItem(null); }} product={selectedItem} />

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-4 border-white/5 bg-white/[0.01] flex items-center gap-3">
                    <div className="p-2.5 bg-teal-500/10 rounded-xl border border-teal-500/10">
                        <Package className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Matrix Products</p>
                        <h3 className="text-lg font-black text-white leading-none">{products.length}</h3>
                    </div>
                </div>
                <div className="glass-card p-4 border-rose-500/10 bg-rose-500/5 flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/10">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-rose-500/70 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Low Stock Alerts</p>
                        <h3 className="text-lg font-black text-rose-500 leading-none">{lowStockCount}</h3>
                    </div>
                </div>
                <div className="glass-card p-4 border-emerald-500/10 bg-emerald-500/5 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                        <BarChart3 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-emerald-500/70 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Inventory Value</p>
                        <h3 className="text-lg font-black text-emerald-500 leading-none">KES {inventoryValue.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                <div className="relative w-full md:w-80 pl-2">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="SEARCH MATRIX ITEMS..."
                        className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:border-teal-500/30 transition-all font-bold uppercase tracking-tight text-[10px] text-white placeholder-slate-700"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="flex items-center gap-2 pr-1">
                    {canEdit && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 premium-gradient text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.01] transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Hardware
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden">
                <table className="w-full text-left border-collapse font-bold uppercase tracking-tight">
                    <thead>
                        <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                            <th className="px-5 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em]">Item Description</th>
                            <th className="px-5 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em]">Category</th>
                            <th className="px-5 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] text-center">Stock Level</th>
                            <th className="px-5 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] text-right">Selling Price</th>
                            <th className="px-5 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] text-center">Status</th>
                            <th className="px-5 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {paginatedItems.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center group-hover:border-teal-500/20 transition-all shadow-inner">
                                            <Package className="w-4 h-4 text-slate-700 group-hover:text-teal-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-200 uppercase tracking-tighter text-sm italic">{item.name}</p>
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{item.unit}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3">
                                    <span className="px-2 py-0.5 rounded-md bg-teal-500/5 border border-teal-500/10 text-[8px] font-black text-teal-600 uppercase tracking-widest">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <p className={`font-black text-lg leading-none ${item.stock === 0 ? 'text-rose-500/50' : 'text-slate-200'}`}>{item.stock}</p>
                                    <p className="text-[8px] text-slate-600 font-extrabold uppercase tracking-widest mt-0.5">Quantity</p>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <p className="font-black text-teal-400 text-lg tracking-tighter leading-none">KES {item.price.toLocaleString()}</p>
                                    <p className="text-[8px] text-slate-700 font-bold uppercase mt-0.5 tracking-tight">Wholesale: {item.costPrice.toLocaleString()}</p>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    {item.stock === 0 ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/5 text-rose-500 border border-rose-500/10">
                                            <span className="text-[8px] font-black uppercase tracking-widest">Out of Stock</span>
                                        </div>
                                    ) : item.stock <= item.minStock ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/5 text-rose-500 border border-rose-500/10">
                                            <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse"></div>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Reorder</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Stable</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {canEdit && (
                                            <>
                                                <button onClick={() => handleStock(item)} title="Quick Restock" className="w-8 h-8 rounded-lg bg-blue-500/5 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/10 transition-all"><ArrowUpRight className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleEdit(item)} title="Modify Matrix Item" className="w-8 h-8 rounded-lg bg-teal-500/5 hover:bg-teal-500/20 text-teal-500 flex items-center justify-center border border-teal-500/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                            </>
                                        )}
                                        {canDelete && (
                                            <button onClick={() => handleDelete(item.id, item.name)} title="Purge from Matrix" className="w-8 h-8 rounded-lg bg-rose-500/5 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                        )}
                                        {!canEdit && !canDelete && (
                                            <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">READ_ONLY</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.05] bg-white/[0.01]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-4 py-2 bg-slate-900 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-20 transition-all"
                        >
                            Previous
                        </button>
                        <div className="flex items-center px-4 text-[10px] font-black text-teal-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-4 py-2 bg-slate-900 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-20 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
