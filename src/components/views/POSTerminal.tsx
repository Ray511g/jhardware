"use client";

import React, { useState } from "react";
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    Smartphone,
    ChevronRight,
    Package,
    UserCog,
    CheckCircle2,
    Users,
    Lock
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { generateReceiptPDF } from "@/lib/pdf-service";
import ReceiptModal from "../modals/ReceiptModal";
import MpesaReconcilePanel from "../modals/MpesaReconcilePanel";

export default function POSTerminal() {
    const { products, addOrder, contractors, config } = useApp();
    const { user } = useAuth();
    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Mpesa" | "Card" | "Credit">("Cash");
    const [selectedContractorId, setSelectedContractorId] = useState("");
    const [buyerKraPin, setBuyerKraPin] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [transactionRef, setTransactionRef] = useState("");
    const [mpesaPaymentId, setMpesaPaymentId] = useState<string | undefined>(undefined);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("SYNCHRONIZING...");
    const [receiptData, setReceiptData] = useState<{ isOpen: boolean, order: any, pdfUrl: string }>({
        isOpen: false,
        order: null,
        pdfUrl: ""
    });

    // Strict Clearance Protocol
    const canUseTerminal = user?.role === "Admin" || user?.permissions?.includes("pos_terminal");

    if (!canUseTerminal) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Terminal Offline</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks clearance for Operational Terminal access.</p>
            </div>
        );
    }

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const taxPercent = config?.taxPercentage || 16.0;
    const isTaxInclusive = config?.taxInclusive ?? true;

    const { subtotal, total, vat } = React.useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        let t, tot;
        if (isTaxInclusive) {
            tot = sub;
            const netSub = tot / (1 + (taxPercent / 100));
            t = tot - netSub;
        } else {
            t = sub * (taxPercent / 100);
            tot = sub + t;
        }
        return { subtotal: sub, total: tot, vat: t };
    }, [cart, taxPercent, isTaxInclusive]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCompleteOrder = async () => {
        if (cart.length === 0) return;
        if (paymentMethod === "Credit" && !selectedContractorId) {
            alert("Security Protocol: Please select a verified contractor for credit transactions.");
            return;
        }
        if (paymentMethod === "Mpesa" && !transactionRef) {
            alert("Security Protocol: Please select or enter an M-Pesa receipt to reconcile payment.");
            return;
        }

        setIsProcessing(true);
        setProcessingMessage("SYNCHRONIZING...");

        const items = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
        }));

        const totalAmount = total;
        const snapMethod = paymentMethod;
        const finalReceiptRef = transactionRef;

        try {
            // M-Pesa: payment already reconciled via MpesaReconcilePanel
            if (snapMethod === "Mpesa") {
                setProcessingMessage("CONFIRMING MPESA PAYMENT...");
                // Mark payment as matched in DB (non-blocking)
                try {
                    await fetch("/api/mpesa/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId: mpesaPaymentId || null })
                    });
                } catch (e) { /* non-blocking */ }
                setProcessingMessage("PAYMENT RECONCILED");
            }

            setProcessingMessage("FINALIZING LEDGER...");
            const newOrder = await addOrder({
                total: totalAmount,
                paymentMethod: snapMethod,
                contractorId: snapMethod === "Credit" ? selectedContractorId : undefined,
                customerName: customerName || undefined,
                transactionRef: snapMethod === "Mpesa" ? (finalReceiptRef || undefined) : (transactionRef || undefined),
                buyerKraPin: buyerKraPin || undefined,
                items
            });

            const receiptOrder = {
                ...newOrder,
                buyerKraPin: buyerKraPin || undefined,
                items: items.map((item: any) => ({
                    ...item,
                    product: products.find((p: any) => p.id === item.productId)
                }))
            };

            const pdfBlobUrl = await generateReceiptPDF(receiptOrder, config);

            setReceiptData({
                isOpen: true,
                order: receiptOrder,
                pdfUrl: pdfBlobUrl.toString()
            });

            setCart([]);
            setSearchQuery("");
            setSelectedContractorId("");
            setBuyerKraPin("");
            setCustomerName("");
            setTransactionRef("");
            setMpesaPaymentId(undefined);
            setPaymentMethod("Cash");
        } catch (error: any) {
            console.error(error);
            alert(`POS System Exception: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in relative z-10 text-[10px] text-white">
            <ReceiptModal
                isOpen={receiptData.isOpen}
                onClose={() => {
                    setReceiptData({ ...receiptData, isOpen: false });
                }}
                order={receiptData.order}
                pdfUrl={receiptData.pdfUrl}
            />

            {/* Area Left: Inventory Matrix */}
            <div className="lg:col-span-2 space-y-4">
                <div className="glass-card p-2 border-white/5 bg-white/[0.01]">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify inventory unit..."
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-[10px] font-bold text-white focus:outline-none focus:border-teal-500/30 transition-all uppercase tracking-widest placeholder-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProducts.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className={`glass-card p-2 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all group text-left relative overflow-hidden ${product.stock <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                        >
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-2.5 h-2.5 text-teal-500" />
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center mb-1.5 border border-white/5 group-hover:border-teal-500/20 transition-all">
                                <Package className="w-3.5 h-3.5 text-slate-700 group-hover:text-teal-500" />
                            </div>
                            <h4 className="font-black text-slate-200 text-[9px] uppercase tracking-tighter mb-0.5 line-clamp-1">{product.name}</h4>
                            <p className="text-[8px] text-teal-500 font-black">Kshs {product.price.toLocaleString()}</p>
                            <div className="mt-1 flex items-center justify-between">
                                <span className={`text-[6px] font-black px-1 py-0.5 rounded ${product.stock < 10 ? 'bg-rose-500/10 text-rose-500/80' : 'bg-emerald-500/10 text-emerald-500/80'}`}>
                                    {product.stock}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Area Right: Transaction Engine */}
            <div className="space-y-3">
                {/* Cart Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5 text-teal-500" />
                        <span className="font-black uppercase tracking-widest text-slate-400 text-[9px]">
                            Active Cart ({cart.length})
                        </span>
                    </div>
                    {cart.length > 0 && (
                        <button
                            onClick={() => setCart([])}
                            className="text-[7px] font-black text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                        >
                            <Trash2 className="w-2.5 h-2.5" /> Clear
                        </button>
                    )}
                </div>

                {/* Cart Items */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-slate-700 text-[8px] font-black uppercase tracking-widest">
                            No items in cart
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-2 glass-card p-2 border-white/5 bg-white/[0.01]">
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[9px] text-slate-200 truncate uppercase tracking-tight">{item.product.name}</p>
                                    <p className="text-[8px] text-teal-500 font-black">Kshs {(item.product.price * item.quantity).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                                        <Minus className="w-2.5 h-2.5 text-slate-400" />
                                    </button>
                                    <span className="w-5 text-center font-black text-[10px] text-white">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                                        <Plus className="w-2.5 h-2.5 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals */}
                <div className="glass-card p-3 border-white/5 bg-white/[0.01] space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                        <span className="text-[8px] font-black uppercase tracking-widest">Subtotal</span>
                        <span className="text-[9px] font-black">Kshs {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span className="text-[8px] font-black uppercase tracking-widest">VAT ({taxPercent}%)</span>
                        <span className="text-[9px] font-black">Kshs {vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total</span>
                        <h4 className="text-xl font-black text-teal-400 tracking-tighter leading-none italic">Kshs {total.toLocaleString()}</h4>
                    </div>
                </div>

                {/* Payment Selection */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { id: "Cash", icon: Banknote },
                        { id: "Mpesa", icon: Smartphone },
                        { id: "Card", icon: CreditCard },
                        { id: "Credit", icon: UserCog }
                    ].map((method) => (
                        <button
                            key={method.id}
                            onClick={() => {
                                setPaymentMethod(method.id as any);
                                if (method.id !== "Credit") setSelectedContractorId("");
                                if (method.id !== "Mpesa") { setTransactionRef(""); setMpesaPaymentId(undefined); }
                            }}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all ${paymentMethod === method.id
                                ? "bg-teal-500 border-teal-400 text-white shadow-xl shadow-teal-500/20 scale-105"
                                : "bg-slate-950 border-white/5 text-slate-700 hover:border-white/10 hover:bg-slate-900"
                                }`}
                        >
                            <method.icon className="w-4 h-4" />
                            <span className="text-[7px] font-black uppercase tracking-widest">{method.id}</span>
                        </button>
                    ))}
                </div>

                {/* Optional Traceability Inputs */}
                <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="BUYER NAME (OPTIONAL)"
                            className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-[9px] font-bold text-slate-300 focus:outline-none focus:border-teal-500/30 transition-all uppercase tracking-widest placeholder-slate-700"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="BUYER KRA PIN"
                            className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-[9px] font-bold text-slate-300 focus:outline-none focus:border-teal-500/30 transition-all uppercase tracking-widest placeholder-slate-700"
                            value={buyerKraPin}
                            onChange={(e) => setBuyerKraPin(e.target.value)}
                        />
                    </div>
                </div>

                {/* Credit: Contractor Selector */}
                {paymentMethod === "Credit" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3 h-3 text-amber-500" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Auth Contractor Account</span>
                        </div>
                        <select
                            value={selectedContractorId}
                            title="Select Contractor Account"
                            onChange={(e) => setSelectedContractorId(e.target.value)}
                            className="w-full bg-slate-950 border border-amber-500/20 rounded-xl py-3 px-4 text-[10px] font-bold text-slate-200 focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-widest appearance-none cursor-pointer"
                        >
                            <option value="">Select Target Account...</option>
                            {contractors.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} (BAL: Kshs {c.balance.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* M-Pesa: Reconciliation Panel */}
                {paymentMethod === "Mpesa" && (
                    <MpesaReconcilePanel
                        total={total}
                        onConfirm={(ref: string, paymentId?: string) => {
                            setTransactionRef(ref);
                            setMpesaPaymentId(paymentId);
                        }}
                        confirmedRef={transactionRef}
                    />
                )}

                {/* Finalize Button */}
                <button
                    onClick={handleCompleteOrder}
                    disabled={isProcessing || cart.length === 0}
                    className="w-full py-4 premium-gradient text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:hover:scale-100 flex items-center justify-center gap-3 group"
                >
                    {isProcessing ? (
                        <span className="animate-pulse">{processingMessage}</span>
                    ) : (
                        <>
                            Finalize Transaction
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}