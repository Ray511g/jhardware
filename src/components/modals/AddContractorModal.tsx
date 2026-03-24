"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { UserPlus, Phone, ShieldCheck, Briefcase } from "lucide-react";

interface AddContractorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddContractorModal({ isOpen, onClose }: AddContractorModalProps) {
    const { addContractor } = useApp();
    const [formData, setFormData] = useState({
        name: "",
        phone: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addContractor(formData);
            setFormData({ name: "", phone: "" });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Contractor Provisioning">
            <div className="p-4 space-y-8">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/5">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Account Activation</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Initializing Trust Matrix Profile</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1 mb-2 block">Contractor Identity</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    required
                                    placeholder="Entity Name or Individual Alias"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/30 transition-all placeholder:text-slate-800"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1 mb-2 block">Communication Channel</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    required
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/30 transition-all placeholder:text-slate-800"
                                    placeholder="+254 XXX XXX XXX"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-4 items-start">
                        <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/80 mb-1">Trust Protocol Notice</p>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-tighter">Enabling credit lines. All ledger entries are immutable and cryptographically timestamped for audit integrity.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 premium-gradient rounded-xl font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 text-[10px]"
                    >
                        {isSubmitting ? "Syncing Profile..." : "Activate Trust Account"}
                    </button>
                </form>
            </div>
        </Modal>
    );
}
