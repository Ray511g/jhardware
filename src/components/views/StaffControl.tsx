"use client";

import React, { useState } from "react";
import {
    UserCog,
    ShieldCheck,
    Clock,
    UserPlus,
    Activity,
    CheckCircle2,
    Lock,
    Trash2,
    Edit2,
    ShieldAlert,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Search,
    Users,
    Shield,
    ShoppingBag,
    Package,
    TrendingDown,
    Save,
    X,
    Settings,
    ArrowRightCircle,
    MoveRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AddStaffModal from "../modals/AddStaffModal";
import { motion, AnimatePresence } from "framer-motion";

// Hierarchical Protocol Definition for the Tree
const PROTOCOL_STRUCTURE = [
    {
        id: "personnel",
        label: "PERSONNEL MANAGEMENT",
        children: [
            { id: "staff_view", label: "VIEW REGISTRY" },
            { id: "staff_add", label: "PROVISION PROFILE (ADD)" },
            { id: "staff_edit", label: "MODIFY PROFILE (EDIT)" },
            { id: "staff_delete", label: "PURGE PERSONNEL (DELETE)" },
            { id: "audit_view", label: "SECURITY AUDIT" },
        ]
    },
    {
        id: "inventory",
        label: "INVENTORY LOGISTICS",
        children: [
            { id: "inventory_view", label: "VIEW STOCK" },
            { id: "inventory_add", label: "ADD NEW UNIT" },
            { id: "inventory_edit", label: "MODIFY MANIFEST (EDIT)" },
            { id: "inventory_delete", label: "PURGE STOCK UNIT (DELETE)" },
            { id: "stock_in", label: "STOCK INWARD PROCESSING" },
        ]
    },
    {
        id: "terminal",
        label: "TERMINAL PROTOCOLS",
        children: [
            { id: "pos_terminal", label: "TERMINAL ACCESS" },
            { id: "pos_void", label: "VOID TRANSACTION" },
            { id: "pos_discount", label: "PRICE OVERRIDE" },
            { id: "pos_return", label: "PROCESS RETURNS" },
        ]
    },
    {
        id: "sales",
        label: "SALES INTELLIGENCE",
        children: [
            { id: "sales_view", label: "VIEW SALES LOGS" },
            { id: "sales_edit", label: "MODIFY RECORDS" },
            { id: "sales_delete", label: "PURGE SALE ENTRY" },
            { id: "sales_report", label: "DATA EXPORT" },
        ]
    },
    {
        id: "vendors",
        label: "SUPPLY PARTNER NETWORK",
        children: [
            { id: "vendors_view", label: "VIEW VENDORS" },
            { id: "vendors_add", label: "ADD PARTNER" },
            { id: "vendors_edit", label: "EDIT PARTNER" },
            { id: "vendors_delete", label: "PURGE PARTNER" },
        ]
    },
    {
        id: "ledger",
        label: "FISCAL LEDGERS (CONTRACTORS)",
        children: [
            { id: "ledger_view", label: "VIEW LEDGER" },
            { id: "ledger_add", label: "POST PAYMENT (ADD)" },
            { id: "ledger_edit", label: "MODIFY ENTRY" },
            { id: "ledger_delete", label: "PURGE ENTRY" },
        ]
    },
    {
        id: "expenses",
        label: "EXPENDITURE CONTROL",
        children: [
            { id: "expenses_view", label: "VIEW EXPENSES" },
            { id: "expenses_add", label: "RECORD OUTFLOW (ADD)" },
            { id: "expenses_edit", label: "MODIFY EXPENSE" },
            { id: "expenses_delete", label: "PURGE EXPENSE" },
        ]
    },
    {
        id: "system",
        label: "SYSTEM INFRASTRUCTURE",
        children: [
            { id: "settings_view", label: "VIEW CONFIG" },
            { id: "settings_edit", label: "MODIFY SYSTEM LOGIC (EDIT)" },
            { id: "tax_manage", label: "TAX COMPLIANCE" },
            { id: "backup_exec", label: "DATA SYNCHRONIZATION" },
        ]
    }
];

export default function StaffControl() {
    const { staff, deleteStaff, updateStaff } = useApp();
    const { user } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Protocol Assignment Modal State
    const [assignmentStaff, setAssignmentStaff] = useState<any>(null);
    const [tempPermissions, setTempPermissions] = useState<string[]>([]);
    const [auditStaff, setAuditStaff] = useState<any>(null);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(["personnel", "terminal"]);

    const canManage = user?.role === "Admin" || user?.permissions?.includes("staff_manage");

    if (!canManage) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center opacity-50 grayscale animate-fade-in text-white">
                <Lock className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-rose-500 leading-none">Access Restricted</h2>
                <p className="text-slate-500 mt-3 font-black uppercase tracking-widest text-[10px]">Your personnel profile lacks sufficient clearance for Human Resources Matrix.</p>
            </div>
        );
    }

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredStaff = staff?.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`SECURITY PROTOCOL: Are you sure you want to PERMANENTLY purge ${name}?`)) {
            await deleteStaff(id);
        }
    };

    const toggleTempPermission = (permId: string) => {
        setTempPermissions(prev =>
            prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
        );
    };

    const handleSavePermissions = async () => {
        if (!assignmentStaff) return;
        try {
            await updateStaff(assignmentStaff.id, {
                ...assignmentStaff,
                permissions: tempPermissions
            });
            setAssignmentStaff(null);
        } catch (error) {
            console.error("Failed to commit protocols:", error);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-[10px] text-white">
            <AddStaffModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setSelectedStaff(null); }}
                staffMember={selectedStaff}
            />

            {/* Protocol Tree Assignment Overlay (The "Assign Roles" Modal from your image) */}
            <AnimatePresence>
                {assignmentStaff && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-[#020617] border border-amber-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none"></div>

                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                        <ShieldCheck className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Assign Protocols</h3>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Configuring Clearance for: {assignmentStaff.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setAssignmentStaff(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                                {PROTOCOL_STRUCTURE.map((group) => (
                                    <div key={group.id} className="space-y-1">
                                        <button
                                            onClick={() => setExpandedGroups(prev => prev.includes(group.id) ? prev.filter(g => g !== group.id) : [...prev, group.id])}
                                            className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all font-black text-[9px] uppercase tracking-widest text-slate-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedGroups.includes(group.id) ? <ChevronDown size={14} className="text-amber-500" /> : <ChevronRight size={14} className="text-slate-600" />}
                                                {group.label}
                                            </div>
                                            <span className="text-[7px] text-slate-600 font-bold">{group.children.length} PROFILES</span>
                                        </button>

                                        {expandedGroups.includes(group.id) && (
                                            <div className="pl-8 space-y-2 py-2">
                                                {group.children.map((child) => (
                                                    <label key={child.id} className="flex items-center gap-4 p-3.5 bg-slate-950/40 rounded-xl border border-white/[0.03] hover:border-amber-500/20 group cursor-pointer transition-all">
                                                        <div className={`relative w-4 h-4 rounded border transition-all flex items-center justify-center ${tempPermissions.includes(child.id) ? "bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-slate-900 border-white/10"}`}>
                                                            {tempPermissions.includes(child.id) && <CheckCircle2 size={10} className="text-white" />}
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={tempPermissions.includes(child.id)}
                                                                onChange={() => toggleTempPermission(child.id)}
                                                            />
                                                        </div>
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest transition-all ${tempPermissions.includes(child.id) ? "text-slate-200" : "text-slate-500 group-hover:text-slate-400"}`}>
                                                            {child.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 border-t border-white/5 bg-slate-950/50 flex gap-4">
                                <button onClick={() => setAssignmentStaff(null)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Abort</button>
                                <button
                                    onClick={handleSavePermissions}
                                    className="flex-2 px-10 py-4 premium-gradient rounded-2xl font-black uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                                >
                                    <Save className="w-4 h-4" /> COMMIT CHANGES
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Tactical intelligence stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-white/5 bg-white/[0.01] flex items-center gap-5">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/10">
                        <Users className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                        <p className="text-slate-600 font-black uppercase tracking-[0.2em] mb-1">Human Assets</p>
                        <h4 className="text-2xl font-black text-white tracking-tighter leading-none">{staff.length} Personnel</h4>
                    </div>
                </div>
                <div className="glass-card p-6 border-emerald-500/10 bg-emerald-500/5 flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10">
                        <Activity className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-emerald-500/60 font-black uppercase tracking-[0.2em] mb-1">Active Profiles</p>
                        <h4 className="text-2xl font-black text-emerald-400 tracking-tighter leading-none">Operational</h4>
                    </div>
                </div>
                <div className="glass-card p-6 border-amber-500/10 bg-amber-500/5 flex items-center gap-5">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/10">
                        <ShieldCheck className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-amber-500/60 font-black uppercase tracking-[0.2em] mb-1">Clearance Protocol</p>
                        <h4 className="text-2xl font-black text-amber-500 tracking-tighter leading-none">Tier-1 HUB</h4>
                    </div>
                </div>
            </div>

            {/* Search & Bulk Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] border border-white/5 p-2 rounded-2xl backdrop-blur-3xl">
                <div className="relative w-full md:w-96 pl-2 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5 group-focus-within:text-teal-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="IDENTIFY PERSONNEL..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 focus:border-teal-500/40 transition-all font-black uppercase tracking-widest text-white outline-none"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto pr-2">
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest px-2 min-w-[80px] text-center">
                                Page {currentPage} / {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 premium-gradient rounded-xl hover:scale-105 transition-all font-black uppercase tracking-widest shadow-xl text-white whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" /> Provision Specialist
                    </button>
                </div>
            </div>

            {/* Specialist Table */}
            <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden rounded-[2rem] shadow-2xl relative overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                            <th className="px-8 py-6 font-black text-slate-500 uppercase tracking-widest">Specialist Profile</th>
                            <th className="px-8 py-6 font-black text-slate-500 uppercase tracking-widest">Access Role</th>
                            <th className="px-8 py-6 font-black text-slate-500 uppercase tracking-widest text-center">Telemetry</th>
                            <th className="px-8 py-6 font-black text-slate-500 uppercase tracking-widest text-center">Protocol Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {paginatedStaff.map((person) => (
                            <tr key={person.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-teal-500 font-black relative">
                                            {person.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase italic text-sm">{person.name}</p>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{person.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg font-black uppercase tracking-widest text-[8px]">
                                        {person.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 text-emerald-500 rounded-full border border-emerald-500/10">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                                        <span className="text-[8px] font-black uppercase">SYNC_ACTIVE</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => { setSelectedStaff(person); setIsAddModalOpen(true); }}
                                            className="w-8 h-8 rounded-lg bg-teal-500/5 text-teal-500 border border-teal-500/10 hover:bg-teal-500/20 transition-all flex items-center justify-center" title="Edit Profile"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAssignmentStaff(person);
                                                setTempPermissions(person.permissions || []);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-amber-500/5 text-amber-500 border border-amber-500/10 hover:bg-amber-500/20 transition-all flex items-center justify-center" title="Assign Protocols"
                                        >
                                            <ShieldCheck size={14} />
                                        </button>
                                        <button
                                            onClick={() => setAuditStaff(person)}
                                            className="w-8 h-8 rounded-lg bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-500/20 transition-all flex items-center justify-center" title="View Access Map"
                                        >
                                            <ArrowRightCircle size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(person.id, person.name)}
                                            className="w-8 h-8 rounded-lg bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500/20 transition-all flex items-center justify-center" title="Remove Profile"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {/* Master Access Map Overlay (Audit View) */}
            <AnimatePresence>
                {auditStaff && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-end backdrop-blur-sm bg-black/40">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="h-full w-full max-w-xl bg-[#020617] border-l border-blue-500/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] p-10 relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                        <ArrowRightCircle className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Access Audit</h3>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Full Intelligence Map: {auditStaff.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setAuditStaff(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-white/5 bg-white/[0.02]">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-4">
                                {PROTOCOL_STRUCTURE.map((group) => (
                                    <div key={group.id} className="space-y-4">
                                        <div className="flex items-center gap-4 opacity-50">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">{group.label}</span>
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {group.children.map((child) => {
                                                const hasAccess = auditStaff.permissions?.includes(child.id) || auditStaff.role === "Admin";
                                                return (
                                                    <div
                                                        key={child.id}
                                                        className={`p-5 rounded-2xl border transition-all flex items-center justify-between group ${hasAccess
                                                            ? "bg-blue-500/5 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                                                            : "bg-slate-950 border-white/[0.03] opacity-40grayscale"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-2 h-2 rounded-full ${hasAccess ? "bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-slate-800"}`}></div>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${hasAccess ? "text-slate-200" : "text-slate-600"}`}>
                                                                {child.label}
                                                            </span>
                                                        </div>
                                                        {hasAccess ? (
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                                                                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                                                <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">AUTHORIZED</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-white/5 opacity-50">
                                                                <Lock className="w-3 h-3 text-slate-700" />
                                                                <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">LOCKED</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-30 italic">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                    <p className="font-black text-[8px] uppercase tracking-widest italic">Live Security Audit Log • {new Date().toLocaleTimeString()}</p>
                                </div>
                                <p className="text-[8px] font-black uppercase tracking-widest italic">ID: {auditStaff.id.slice(0, 8)}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer Protocol Info */}
            <div className="flex items-center justify-between px-4 opacity-30 italic">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                    <p className="font-black text-[8px] uppercase tracking-widest">Personnel Sync Hub v5.1.0 • Master Clearance Active</p>
                </div>
                <p className="font-black text-[8px] uppercase tracking-widest italic">Latency: 0.02ms</p>
            </div>
        </div>
    );
}
