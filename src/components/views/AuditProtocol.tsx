"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldAlert,
    Search,
    Calendar,
    User,
    Terminal,
    Activity,
    ShieldCheck,
    History,
    FileText,
    Database,
    AlertCircle
} from "lucide-react";

export default function AuditProtocol() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterModule, setFilterModule] = useState("all");

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/audit");
            const data = await res.json();
            if (res.ok) setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesModule = filterModule === "all" || log.module === filterModule;
        return matchesSearch && matchesModule;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8 animate-fade-in text-[10px]">
            {/* Intel Dashboard Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 border-rose-500/10 bg-rose-500/5">
                    <p className="text-rose-500/60 font-black uppercase tracking-[0.2em] mb-1">System Integrity</p>
                    <h4 className="text-xl font-black text-white tracking-tighter leading-none flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                        SECURED
                    </h4>
                </div>
                <div className="glass-card p-4 border-white/5 bg-white/[0.01]">
                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] mb-1">Critical Events</p>
                    <h4 className="text-xl font-black text-white tracking-tighter leading-none">0 Anomalies</h4>
                </div>
                <div className="glass-card p-4 border-white/5 bg-white/[0.01]">
                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] mb-1">Total Logs</p>
                    <h4 className="text-xl font-black text-white tracking-tighter leading-none">{logs.length} Operations</h4>
                </div>
                <div className="glass-card p-4 border-teal-500/10 bg-teal-500/5">
                    <p className="text-teal-500/60 font-black uppercase tracking-[0.2em] mb-1">Last Sync</p>
                    <h4 className="text-xl font-black text-teal-400 tracking-tighter leading-none">NOW</h4>
                </div>
            </div>

            {/* Filter Matrix */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] border border-white/5 p-2 rounded-xl backdrop-blur-3xl">
                <div className="relative w-full md:w-96 pl-2 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5 group-focus-within:text-teal-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH AUDIT TRAIL..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-teal-500/40 transition-all font-black uppercase tracking-widest text-white placeholder-slate-700"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="flex items-center gap-2 pr-1">
                    {["all", "Inventory", "POS", "Staff", "Vendors", "Auth"].map(mod => (
                        <button
                            key={mod}
                            onClick={() => {
                                setFilterModule(mod);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg font-black uppercase tracking-widest transition-all border ${filterModule === mod
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                                : "bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            {mod}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tactical Log Grid */}
            <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden rounded-2xl shadow-all-sides overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                            <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-[0.3em]">Timestamp</th>
                            <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-[0.3em]">Specialist</th>
                            <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-[0.3em]">Action Type</th>
                            <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-[0.3em]">Module Cluster</th>
                            <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-[0.3em]">Operation Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="w-10 h-10 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
                                    <p className="mt-4 font-black uppercase tracking-widest text-slate-600 animate-pulse">Decrypting Audit Trail...</p>
                                </td>
                            </tr>
                        ) : paginatedLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center opacity-20">
                                    <Database className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                                    <p className="font-black uppercase tracking-[0.5em] text-xs">No protocol logs indexed</p>
                                </td>
                            </tr>
                        ) : paginatedLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <History className="w-3.5 h-3.5 text-slate-600" />
                                        <span className="font-black text-slate-400 uppercase tracking-tighter">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center border border-white/5">
                                            <User className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <span className="font-black text-slate-200 uppercase tracking-widest">{log.staffName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border border-white/5 ${log.action === "VOID" || log.action === "DELETE" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                        log.action === "CREATE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                        }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-3.5 h-3.5 text-slate-700" />
                                        <span className="font-bold text-slate-500 uppercase tracking-widest italic">{log.module}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="p-3 bg-slate-950 border border-white/5 rounded-xl font-bold text-slate-500 tracking-tight leading-relaxed">
                                        {log.details || "SYSTEM_PROTOCOL_EXECUTED"}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.01] border border-white/5 rounded-xl">
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[9px]">
                        Entry {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} Records
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                        >
                            <History className="w-4 h-4 rotate-180" />
                        </button>
                        <span className="font-black text-teal-500 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                        >
                            <History className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}


            {/* Protocol Footer */}
            <div className="flex items-center gap-3 opacity-30 italic">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                <p className="font-black text-[8px] uppercase tracking-widest">Master Audit Protocol Active • All Operations Immutable and Timestamped</p>
            </div>
        </div>
    );
}
