"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    username: string;
    role: string;
    permissions?: string[];
}

interface AuthContextType {
    user: User | null;
    login: (userData: User, token: string) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("biashara_user");
            const token = localStorage.getItem("biashara_token");

            if (savedUser && token) {
                setUser(JSON.parse(savedUser));
            }
        } catch (err) {
            console.error("Auth initialization failed:", err);
            localStorage.removeItem("biashara_user");
            localStorage.removeItem("biashara_token");
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User, token: string) => {
        setUser(userData);
        localStorage.setItem("biashara_user", JSON.stringify(userData));
        localStorage.setItem("biashara_token", token);
        window.location.href = "/"; // Force a full reload to ensure all data reflects correctly
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Server logout failed:", err);
        }
        setUser(null);
        localStorage.removeItem("biashara_user");
        localStorage.removeItem("biashara_token");
        window.location.href = "/login"; // Force a full reload to clear state
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
