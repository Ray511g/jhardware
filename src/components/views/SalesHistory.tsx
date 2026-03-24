"use client";

import React, { useState, useEffect } from "react";
import {
    History,
    Search,
    Filter,
    Printer,
    ArrowRight,
    ShoppingBag,
    Calendar,
    CreditCard,
    Smartphone,
    Banknote,
    UserCog,
    FileText,
    Lock
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { generateReceiptPDF } from "@/lib/pdf-service";
import ReceiptModal from "../modals/ReceiptModal";

export default function SalesHistory() {
    const { orders, products, config } = useApp();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMethod, setFilterMethod] = useState<string>("All");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [receiptData, setReceiptData] = useState<{ isOpen: boolean, order: any, pdfUrl: string }>({
        isOpen: false,
        order: null,
        pdfUrl: ""
    });

    // Strict Clearance Protocol
    const canView = user?.role === "Admin" || user?.permissions?.includes("pos_terminal") || user?.permissions?.includes("reports_view");

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks clearance for Transaction Telemetry.</p>
            </div>
        );
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.orderNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMethod = filterMethod === "All" || order.paymentMethod === filterMethod;
        return matchesSearch && matchesMethod;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterMethod]);

    const handleReprint = async (order: any) => {
        const receiptOrder = {
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                product: products.find(p => p.id === (item.productId || item.product?.id))
            }))
        };

        const pdfUrl = await generateReceiptPDF(receiptOrder, config);
        setReceiptData({
            isOpen: true,
            order: receiptOrder,
            pdfUrl: pdfUrl.toString()
        });
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case "Cash": return Banknote;
            case "Mpesa": return Smartphone;
            case "Card": return CreditCard;
            case "Credit": return UserCog;
            default: return FileText;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-white">
            <ReceiptModal
                isOpen={receiptData.isOpen}
                onClose={() => setReceiptData({ ...receiptData, isOpen: false })}
                order={receiptData.order}
                pdfUrl={receiptData.pdfUrl}
            />

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-4 border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-teal-500/10 rounded-lg">
                            <ShoppingBag className="w-4 h-4 text-teal-500" />
                        </div>
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Total Sales Volume</p>
                    </div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter">{orders.length} <span className="text-[10px] text-slate-500 not-italic uppercase ml-2 tracking-widest">Transactions</span></h3>
                </div>

                <div className="glass-card p-4 border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Gross Revenue</p>
                    </div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter">KES {orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}</h3>
                </div>

                <div className="glass-card p-4 border-emerald-500/10 bg-emerald-500/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <History className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-emerald-500/70 text-[8px] font-black uppercase tracking-widest">System Health</p>
                    </div>
                    <h3 className="text-xl font-black text-emerald-500 italic tracking-tighter">100% <span className="text-[10px] text-emerald-500/50 not-italic uppercase ml-2 tracking-widest">Synced</span></h3>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or SKU..."
                        className="w-full bg-slate-950 border border-white/5 rounded-lg py-2.5 pl-11 pr-4 text-[10px] font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all uppercase tracking-widest placeholder-slate-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {["All", "Cash", "Mpesa", "Card", "Credit"].map((method) => (
                        <button
                            key={method}
                            onClick={() => setFilterMethod(method)}
                            className={`px-4 py-2 rounded-lg border text-[8px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filterMethod === method
                                ? "bg-teal-500 border-teal-400 text-white shadow-lg"
                                : "bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10"
                                }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                                <th className="px-6 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em]">Transaction Trace</th>
                                <th className="px-6 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em]">Timeline</th>
                                <th className="px-6 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em]">Client Profile</th>
                                <th className="px-6 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em]">Payment Ref Matrix</th>
                                <th className="px-6 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] text-right">Yield Value</th>
                                <th className="px-6 py-4 font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] text-center">Protocol Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {paginatedOrders.map((order) => {
                                const MethodIcon = getMethodIcon(order.paymentMethod);
                                return (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center group-hover:border-teal-500/20 transition-all">
                                                    <History className="w-5 h-5 text-slate-700 group-hover:text-teal-500" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-200 text-sm uppercase tracking-tighter italic">#{order.orderNumber || order.id.slice(-6).toUpperCase()}</p>
                                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{order.items.length} Units in Payload</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-300 text-[10px] uppercase leading-none">{new Date(order.date).toLocaleDateString()}</p>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1.5">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.customerName || order.customerPhone || order.buyerKraPin ? (
                                                <div className="space-y-1">
                                                    {order.customerName && <p className="font-black text-slate-300 text-[10px] uppercase">{order.customerName}</p>}
                                                    {order.customerPhone && <p className="text-[8px] text-slate-500 font-bold tracking-widest uppercase">{order.customerPhone}</p>}
                                                    {order.buyerKraPin && <p className="text-[8px] text-teal-600 font-bold tracking-widest uppercase bg-teal-500/10 px-1.5 py-0.5 rounded inline-block">KRA: {order.buyerKraPin}</p>}
                                                </div>
                                            ) : (
                                                <span className="text-[8px] text-slate-700 italic font-bold uppercase">WALK-IN (GUEST)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className={`inline-flex items-center gap-2 w-max px-3 py-1.5 rounded-lg border bg-slate-950/50 ${order.paymentMethod === 'Cash' ? 'border-emerald-500/10 text-emerald-500/80' :
                                                    order.paymentMethod === 'Mpesa' ? 'border-teal-500/10 text-teal-400' :
                                                        order.paymentMethod === 'Credit' ? 'border-rose-500/10 text-rose-500/80' : 'border-blue-500/10 text-blue-400'
                                                    }`}>
                                                    <MethodIcon className="w-3.5 h-3.5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">{order.paymentMethod}</span>
                                                </div>
                                                {order.transactionRef && (
                                                    <p className="text-[7.5px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 border border-white/5 py-1 px-2 rounded w-max">
                                                        REF: <span className="text-teal-500">{order.transactionRef}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-black text-teal-400 text-lg tracking-tighter leading-none">KES {order.total.toLocaleString()}</p>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 italic">Tax Compliance v1.0</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleReprint(order)}
                                                title="Reprint Receipt Protocol"
                                                aria-label="Reprint Transaction Receipt"
                                                className="w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center group-hover:border-teal-500/30 hover:bg-teal-500/10 text-slate-700 hover:text-teal-500 transition-all mx-auto shadow-inner"
                                            >
                                                <Printer className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="py-32 text-center opacity-20">
                            <History className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                            <p className="font-black uppercase tracking-[0.5em] text-[10px]">No transaction telemetry found</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.05] bg-white/[0.01]">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                title="Previous Page"
                                className="px-5 py-2 bg-slate-950 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 disabled:opacity-20 transition-all"
                            >
                                Prev
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                title="Next Page"
                                className="px-5 py-2 bg-slate-950 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 disabled:opacity-20 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
