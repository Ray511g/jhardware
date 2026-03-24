"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
    const { addExpense } = useApp();
    const [formData, setFormData] = useState({
        reason: "",
        amount: 0,
        category: "Operational",
        date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addExpense(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Outflow">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                    <label htmlFor="expenseReason" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Expense Rational</label>
                    <input
                        id="expenseReason"
                        required
                        placeholder="Restock inventory, utilities..."
                        className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-slate-200 placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                        value={formData.reason}
                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label htmlFor="expenseCategory" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Category</label>
                        <select
                            id="expenseCategory"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-slate-200 focus:border-teal-500/30 transition-all outline-none appearance-none"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Operational">Operational</option>
                            <option value="Inventory">Inventory</option>
                            <option value="Utility">Utility</option>
                            <option value="Salary">Salary</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="expenseAmount" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Amount (KES)</label>
                        <input
                            id="expenseAmount"
                            type="number"
                            required
                            placeholder="0.00"
                            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-slate-200 placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none font-mono"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="expenseDate" className="text-[8px] font-black uppercase tracking-widest text-slate-600">Date</label>
                    <input
                        id="expenseDate"
                        type="date"
                        className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-slate-200 focus:border-teal-500/30 transition-all outline-none"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 rounded-lg font-black uppercase tracking-widest text-white shadow-lg transition-all disabled:opacity-20 text-[9px] mt-2"
                >
                    {isSubmitting ? "Committing..." : "Commit Outflow"}
                </button>
            </form>
        </Modal>
    );
}
