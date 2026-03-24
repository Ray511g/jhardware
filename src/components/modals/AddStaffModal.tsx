"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import {
    UserCog,
    Shield,
    KeyRound,
    Fingerprint,
    Lock,
    Unlock,
    Activity,
    Save,
    X,
    Eye,
    EyeOff,
    ShoppingBag,
    Package,
    TrendingDown,
    Users
} from "lucide-react";

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffMember?: any;
}

export default function AddStaffModal({ isOpen, onClose, staffMember }: AddStaffModalProps) {
    const { addStaff, updateStaff } = useApp();
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        role: "Cashier",
        status: "Active",
        shifts: "Morning",
        permissions: [] as string[]
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (staffMember) {
            setFormData({
                name: staffMember.name || "",
                username: staffMember.username || "",
                password: "", // Reset password field when editing
                role: staffMember.role || "STAFF",
                status: staffMember.status || "Active",
                shifts: staffMember.shifts || "Morning",
                permissions: typeof staffMember.permissions === 'string'
                    ? JSON.parse(staffMember.permissions)
                    : staffMember.permissions || []
            });
        } else {
            setFormData({
                name: "",
                username: "",
                password: "",
                role: "STAFF",
                status: "Active",
                shifts: "Morning",
                permissions: []
            });
        }
    }, [staffMember, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (staffMember) {
                // If password is empty, don't update it
                const updateData = { ...formData };
                if (!updateData.password) delete (updateData as any).password;
                await updateStaff(staffMember.id, updateData);
            } else {
                await addStaff(formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={staffMember ? "Secure Protocol: Personal Reset" : "Secure Profile: Personnel Onboarding"}
        >
            <form onSubmit={handleSubmit} className="space-y-6 p-1">
                {/* Identity Cluster */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Real-world Identity</label>
                            <div className="relative group">
                                <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                                <input
                                    required
                                    placeholder="LEGAL FULL NAME..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">System Handle (UID)</label>
                            <div className="relative group">
                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                                <input
                                    required
                                    placeholder="UNIQUE_USER_ID..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                            {staffMember ? "Cryptographic Reset (Leave blank to keep current)" : "Access Credential"}
                        </label>
                        <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required={!staffMember}
                                placeholder="****************"
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-12 text-xs font-bold text-white placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-teal-500"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Shift Allocation */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Deployment Cycle (Shift)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: "Morning", label: "06:00 - 14:00", name: "Alpha (Morning)" },
                            { id: "Evening", label: "14:00 - 22:00", name: "Beta (Evening)" },
                            { id: "Night", label: "22:00 - 06:00", name: "Gamma (Night)" },
                        ].map(shift => (
                            <button
                                key={shift.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, shifts: shift.id })}
                                className={`p-4 rounded-xl border text-center transition-all ${formData.shifts === shift.id
                                    ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                                    : "bg-slate-950 border-white/5 text-slate-600 hover:border-white/10"
                                    }`}
                            >
                                <p className="text-[10px] font-black uppercase tracking-tighter">{shift.name}</p>
                                <p className="text-[7px] font-bold opacity-50 mt-1">{shift.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex items-start gap-4">
                    <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1.5">Onboarding Protocol</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                            Personnel will be registered with <span className="text-white">Zero-Clearance</span> status.
                            Module access must be provisioned via the <span className="text-amber-500">Master Protocol Designer</span> after registry entry.
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all text-[10px] flex items-center justify-center gap-2"
                    >
                        <X size={14} />
                        Abort
                    </button>
                    <button
                        disabled={isSubmitting}
                        className="flex-[2] py-4 premium-gradient rounded-xl font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_rgba(20,184,166,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 text-[10px] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? "Synchronizing Personnel..." : (
                            <>
                                <Save size={14} />
                                {staffMember ? "Confirm Master Reset" : "Authorize Profile Onboarding"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
