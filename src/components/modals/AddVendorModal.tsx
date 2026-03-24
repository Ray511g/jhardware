"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import {
    Building2,
    Target,
    Phone,
    Mail,
    MapPin,
    ShieldCheck,
    Star,
    Save,
    X
} from "lucide-react";

interface AddVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendor?: any;
}

export default function AddVendorModal({ isOpen, onClose, vendor }: AddVendorModalProps) {
    const { addVendor, updateVendor } = useApp();
    const [formData, setFormData] = useState({
        name: "",
        type: "Distributor",
        contact: "",
        email: "",
        address: "",
        rating: 5.0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || "",
                type: vendor.type || "Distributor",
                contact: vendor.contact || "",
                email: vendor.email || "",
                address: vendor.address || "",
                rating: vendor.rating || 5.0
            });
        } else {
            setFormData({
                name: "",
                type: "Distributor",
                contact: "",
                email: "",
                address: "",
                rating: 5.0
            });
        }
    }, [vendor, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (vendor) {
                await updateVendor(vendor.id, formData);
            } else {
                await addVendor(formData);
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
            title={vendor ? "Secure Edit: Partner Profile" : "Secure Profile: Onboard Partner"}
        >
            <form onSubmit={handleSubmit} className="space-y-6 p-2">
                {/* Identity Section */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Company Identity</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                            <input
                                required
                                placeholder="ENTER CORPORATE NAME..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Entity Type</label>
                            <div className="relative group">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                                <select
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white focus:border-teal-500/30 transition-all outline-none appearance-none cursor-pointer"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Manufacturer">Manufacturer</option>
                                    <option value="Distributor">Distributor</option>
                                    <option value="Wholesaler">Wholesaler</option>
                                    <option value="Logistics">Logistics Partner</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Service Rating</label>
                            <div className="relative group">
                                <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-colors w-4 h-4" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="5"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white focus:border-amber-500/30 transition-all outline-none"
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comms Section */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Direct Contact</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                                <input
                                    required
                                    placeholder="+254..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                                <input
                                    type="email"
                                    placeholder="AUTH@PARTNER.COM"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Geographic Origin</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-teal-500 transition-colors w-4 h-4" />
                            <input
                                placeholder="CITY, SECTOR, REGION..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:border-teal-500/30 transition-all outline-none"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
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
                        {isSubmitting ? (
                            "Synchronizing..."
                        ) : (
                            <>
                                <Save size={14} />
                                {vendor ? "Commit Changes" : "Confirm Onboarding"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
