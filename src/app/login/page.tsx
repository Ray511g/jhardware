"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    Lock,
    User,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Cpu,
    Globe,
    Zap,
    LayoutDashboard,
    Eye,
    EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Invalid credentials for this account");
            }

            login(data.user, data.token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex overflow-hidden font-sans selection:bg-teal-500/30 selection:text-teal-200">
            {/* Left Side: Visual Experience */}
            <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-[#020617] border-r border-white/5">
                {/* Industrial Excellence Background */}
                <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
                    {/* 1. Refined Blueprint Grid */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(rgba(45,212,191,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.5) 1px, transparent 1px)`,
                        backgroundSize: '30px 30px'
                    }}></div>

                    {/* 2. Central Industrial Motif (High-End SVG) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <motion.circle
                                cx="400" cy="400" r="300"
                                stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="10 20"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.path
                                d="M400 100 V700 M100 400 H700"
                                stroke="#14b8a6" strokeWidth="0.2"
                                opacity="0.5"
                            />
                            {/* Gear Motif */}
                            <motion.g animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }}>
                                <circle cx="400" cy="400" r="80" stroke="#14b8a6" strokeWidth="1" strokeDasharray="5 5" />
                                {[...Array(8)].map((_, i) => (
                                    <rect key={i} x="385" y="300" width="30" height="20" fill="#14b8a6" opacity="0.2" transform={`rotate(${i * 45} 400 400)`} />
                                ))}
                            </motion.g>
                        </svg>
                    </div>

                    {/* 3. Hardware Icon Constellation (Minimalist) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-full h-full max-w-4xl max-h-[600px]">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                <div className="absolute top-[20%] left-[10%] opacity-20"><Cpu size={120} strokeWidth={0.5} className="text-teal-400" /></div>
                                <div className="absolute bottom-[20%] right-[10%] opacity-20"><ShieldCheck size={120} strokeWidth={0.5} className="text-teal-400" /></div>
                                <div className="absolute top-[10%] right-[20%] opacity-20"><TrendingUp size={100} strokeWidth={0.5} className="text-teal-400" /></div>
                            </motion.div>
                        </div>
                    </div>

                    {/* 4. Subdued Status Monitors */}
                    <div className="absolute bottom-12 left-12 space-y-4 opacity-30">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Global Supply Status: Online</span>
                        </div>
                        <div className="h-[1px] w-32 bg-gradient-to-r from-teal-500/50 to-transparent" />
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Inventory Sync: 99.9%</span>
                        </div>
                    </div>
                </div>

                {/* Brand Overlay */}
                <div className="relative z-20 flex flex-col justify-between p-20 w-full h-full">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="text-teal-400 w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-white tracking-widest uppercase">Operations</span>
                    </div>

                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-7xl font-black text-white leading-[1.05] tracking-tighter"
                        >
                            Professional <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Hardware Control.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-xl mt-10 font-medium max-w-lg leading-relaxed border-l-2 border-teal-500/20 pl-8"
                        >
                            Industrial-grade inventory, sales, and supply chain management for the modern enterprise.
                        </motion.p>
                    </div>

                    <div className="flex gap-16">
                        {[
                            { label: "Precision", icon: Cpu },
                            { label: "Security", icon: ShieldCheck },
                            { label: "Sync", icon: Globe }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <stat.icon className="w-5 h-5 text-teal-500/40" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Exact Image Implementation */}
            <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-8 lg:p-12 relative bg-[#01040f]">
                {/* Ambient Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981]/5 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[420px] p-10 relative group"
                >
                    {/* The Glassmorphic Outer Card */}
                    <div className="absolute inset-0 bg-[#1e293b]/20 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] -z-10" />

                    {/* The Vibrant Border Glow */}
                    <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-br from-[#10b981]/40 via-transparent to-[#10b981]/40 opacity-50 -z-10 blur-[1px]" />
                    <div className="absolute -inset-[2px] rounded-[32px] bg-[#10b981]/20 -z-20 blur-xl opacity-30" />

                    <div className="mb-8">
                        <h3 className="text-3xl font-bold text-white tracking-tight mb-2">SECURE LOGIN</h3>
                        <p className="text-[#10b981] text-sm font-medium tracking-wide">Authorized System Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2.5">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    title="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#0f172a]/80 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-[#10b981]/50 transition-all placeholder-slate-700"
                                    placeholder="admin"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2.5">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    title="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0f172a]/80 border border-white/5 rounded-xl py-4 pl-12 pr-12 text-white focus:outline-none focus:ring-1 focus:ring-[#10b981]/50 transition-all placeholder-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Link Row */}
                        <div className="flex justify-between items-center px-1 text-xs">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex items-center gap-2 text-slate-400 hover:text-[#10b981] transition-colors font-medium"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showPassword ? "Hide Password" : "Show Password"}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-bold text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative py-4 bg-gradient-to-r from-[#059669] via-[#10b981] to-[#059669] hover:brightness-110 text-slate-900 rounded-full font-black uppercase tracking-[0.1em] text-sm transition-all active:scale-[0.98] flex items-center justify-center group/btn shadow-[0_10px_30px_-5px_rgba(16,185,129,0.5)]"
                        >
                            <div className="flex items-center gap-3">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>SIGN IN TO DASHBOARD</span>
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Status Footer */}
                    <div className="mt-10 flex items-center justify-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                        <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981] animate-pulse" />
                        <span>System Status: <span className="text-white">Online</span></span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
