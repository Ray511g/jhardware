"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

export interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    price: number;
    costPrice: number;
    unit: string;
}

export interface Vendor {
    id: string;
    name: string;
    type: string;
    contact: string;
    email: string;
    address: string;
    rating: number;
    balance: number;
}

export interface Order {
    id: string;
    orderNumber?: string;
    date: string;
    items: any[];
    total: number;
    paymentMethod: "Cash" | "Mpesa" | "Card" | "Credit";
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    buyerKraPin?: string;
    transactionRef?: string;
    status: "Completed" | "Pending" | "Void";
}

export interface Contractor {
    id: string;
    name: string;
    phone: string;
    balance: number;
    createdAt: string;
    transactions: { date: string; amount: number; type: "Credit" | "Payment"; reference: string }[];
}

export interface BusinessConfig {
    id: string;
    name: string;
    location: string;
    phone: string;
    email: string;
    taxNumber: string;
    taxPercentage: number;
    taxInclusive: boolean;
    mpesaTill: string;
    mpesaPaybill: string;
    mpesaAccount: string;
}

export interface VendorTransaction {
    id: string;
    vendorId: string;
    poId?: string;
    date: string;
    amount: number;
    method: string;
    reference?: string;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    vendorId: string;
    vendor: Vendor;
    status: string;
    date: string;
    total: number;
    items: string;
    paymentMethod: "Cash" | "Credit";
    paidAmount: number;
    transactions: VendorTransaction[];
}

interface AppState {
    products: Product[];
    vendors: Vendor[];
    orders: Order[];
    contractors: Contractor[];
    staff: any[];
    expenses: any[];
    pos: PurchaseOrder[];
    isLoading: boolean;
    config: BusinessConfig | null;
    updateConfig: (data: Partial<BusinessConfig>) => Promise<void>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    addOrder: (orderData: any) => Promise<any>;
    fetchProducts: () => Promise<void>;
    fetchOrders: () => Promise<void>;
    addVendor: (vendorData: any) => Promise<void>;
    updateVendor: (id: string, data: any) => Promise<void>;
    deleteVendor: (id: string) => Promise<void>;
    addContractor: (contractorData: any) => Promise<void>;
    addContractorTransaction: (data: any) => Promise<void>;
    addStaff: (staffData: any) => Promise<void>;
    updateStaff: (id: string, data: any) => Promise<void>;
    deleteStaff: (id: string) => Promise<void>;
    addExpense: (expenseData: any) => Promise<void>;
    addPO: (poData: any) => Promise<void>;
    updatePO: (id: string, data: any) => Promise<void>;
    addProduct: (productData: any) => Promise<void>;
    updateProduct: (id: string, data: any) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addPOPayment: (poId: string, data: any) => Promise<void>;
    resyncVendor: (id: string) => Promise<void>;
    resetSystem: (confirmation: string) => Promise<void>;
    triggerCloudSync: () => Promise<void>;
    syncStatus: { lastSync: string | null; isSyncing: boolean };
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [pos, setPOs] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState<BusinessConfig | null>(null);
    const [syncStatus, setSyncStatus] = useState<{ lastSync: string | null; isSyncing: boolean }>({
        lastSync: typeof window !== 'undefined' ? localStorage.getItem('last_cloud_sync') : null,
        isSyncing: false
    });

    const fetchJSON = async (url: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                return null; // Gracefully ignore non-JSON (likely redirects)
            }
            return res.json();
        } catch (err) {
            return null;
        }
    };

    const fetchConfig = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/config");
            if (data && !data.error) setConfig(data);
        } catch (error) { console.error("Failed to fetch config:", error); }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/products");
            if (Array.isArray(data)) setProducts(data);
        } catch (error) { console.error("Failed to fetch products:", error); }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/orders");
            if (Array.isArray(data)) setOrders(data);
        } catch (error) { console.error("Failed to fetch orders:", error); }
    }, []);

    const fetchVendors = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/vendors");
            if (Array.isArray(data)) setVendors(data);
        } catch (error) { console.error("Failed to fetch vendors:", error); }
    }, []);

    const fetchContractors = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/contractors");
            if (Array.isArray(data)) setContractors(data);
        } catch (error) { console.error("Failed to fetch contractors:", error); }
    }, []);

    const fetchStaff = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/staff");
            if (Array.isArray(data)) setStaff(data);
        } catch (error) { console.error("Failed to fetch staff:", error); }
    }, []);

    const fetchExpenses = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/expenses");
            if (Array.isArray(data)) setExpenses(data);
        } catch (error) { console.error("Failed to fetch expenses:", error); }
    }, []);

    const fetchPOs = useCallback(async () => {
        try {
            const data = await fetchJSON("/api/po");
            if (Array.isArray(data)) setPOs(data);
        } catch (error) { console.error("Failed to fetch POs:", error); }
    }, []);

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("biashara_token");
            if (!token) {
                // If no token, we are on the login page or logged out. 
                // Don't attempt to fetch protected data.
                setIsLoading(false);
                return;
            }

            try {
                await Promise.all([
                    fetchProducts(),
                    fetchOrders(),
                    fetchVendors(),
                    fetchContractors(),
                    fetchStaff(),
                    fetchExpenses(),
                    fetchPOs(),
                    fetchConfig()
                ]);
                // Optimistically trigger a sync after initial load
                triggerCloudSync();
            } catch (err) {
                // Silent catch during init - individual fetchers log their own errors
            } finally {
                setIsLoading(false);
            }
        };
        init();

        // 15-Minute Periodic Cloud Backup Sync
        const syncInterval = setInterval(() => {
            triggerCloudSync();
        }, 15 * 60 * 1000);

        return () => clearInterval(syncInterval);
    }, []);

    const updateConfig = useCallback(async (data: Partial<BusinessConfig>) => {
        const res = await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const updated = await res.json();
            setConfig(updated);
        } else {
            const error = await res.json();
            alert(`Config Update Failed: ${error.error || "Unknown Error"}`);
        }
    }, []);

    const addOrder = useCallback(async (orderData: any) => {
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });
        if (res.ok) {
            const newOrder = await res.json();
            setOrders(prev => [newOrder, ...prev]);

            // Optimistic Stock Update: Update local products instead of full fetch
            if (newOrder.items) {
                setProducts(prevProducts => prevProducts.map(p => {
                    const orderedItem = newOrder.items.find((oi: any) => oi.productId === p.id);
                    if (orderedItem) {
                        return { ...p, stock: p.stock - orderedItem.quantity };
                    }
                    return p;
                }));
            }

            // Sync contractors if it was a credit sale
            if (orderData.paymentMethod === "Credit") {
                fetchContractors();
            }

            return newOrder;
        } else {
            const error = await res.json();
            throw new Error(error.error || "Order creation failed");
        }
    }, [fetchContractors]);

    const addVendor = useCallback(async (data: any) => {
        const res = await fetch("/api/vendors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const newVendor = await res.json();
            setVendors(prev => [newVendor, ...prev]);
        } else {
            const error = await res.json();
            alert(`Vendor Registration Failed: ${error.error || "Unknown Error"}`);
        }
    }, []);

    const updateVendor = useCallback(async (id: string, data: any) => {
        const res = await fetch(`/api/vendors/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const updated = await res.json();
            setVendors(prev => prev.map(v => v.id === id ? updated : v));
        } else {
            const error = await res.json();
            alert(`Update Failed: ${error.error || "Unknown Error"}`);
        }
    }, []);

    const deleteVendor = useCallback(async (id: string) => {
        const res = await fetch(`/api/vendors/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setVendors(prev => prev.filter(v => v.id !== id));
        } else {
            const error = await res.json();
            alert(`Delete Failed: ${error.error || "Unknown Error"}`);
        }
    }, []);

    const addContractor = async (data: any) => {
        const res = await fetch("/api/contractors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const newContractor = await res.json();
            setContractors(prev => [newContractor, ...prev]);
        } else {
            const error = await res.json();
            alert(`Contractor Registration Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const addContractorTransaction = async (data: any) => {
        const res = await fetch("/api/contractors/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const { updatedContractor } = await res.json();
            setContractors(prev => prev.map(c => c.id === updatedContractor.id ? updatedContractor : c));
        } else {
            const error = await res.json();
            alert(`Transaction Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const addStaff = async (data: any) => {
        const res = await fetch("/api/staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const newStaff = await res.json();
            setStaff(prev => [newStaff, ...prev]);
        } else {
            const error = await res.json();
            alert(`Staff Registration Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const updateStaff = async (id: string, data: any) => {
        // Optimistic Update for instant UI feedback
        const oldStaff = [...staff];
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

        try {
            const res = await fetch(`/api/staff/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const updated = await res.json();
                setStaff(prev => prev.map(s => s.id === id ? updated : s));
            } else {
                setStaff(oldStaff); // Rollback
                const error = await res.json();
                alert(`Staff Update Failed: ${error.error || "Unknown Error"}`);
            }
        } catch (error) {
            setStaff(oldStaff); // Rollback
            console.error("Staff Network Fetch Error:", error);
            alert("Connection Error: Failed to reach server.");
        }
    };

    const deleteStaff = async (id: string) => {
        const res = await fetch(`/api/staff/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setStaff(prev => prev.filter(s => s.id !== id));
        } else {
            const error = await res.json();
            alert(`Staff Deletion Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const addExpense = async (data: any) => {
        const res = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const newExpense = await res.json();
            setExpenses(prev => [newExpense, ...prev]);
        } else {
            const error = await res.json();
            alert(`Expense Logging Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const addPO = async (data: any) => {
        const res = await fetch("/api/po", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            await fetchProducts();
            await fetchPOs();
            await fetchVendors(); // Sync vendor balances
        } else {
            const error = await res.json();
            alert(`PO Generation Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const updatePO = async (id: string, data: any) => {
        // Optimistic Update
        const oldPos = [...pos];
        setPOs(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

        try {
            const res = await fetch(`/api/po/${encodeURIComponent(id)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await fetchProducts();
                await fetchPOs();
                await fetchVendors(); // Sync vendor balances
            } else {
                setPOs(oldPos); // Rollback
                const error = await res.json();
                alert(`Update Failed: ${error.error || "Unknown Error"}`);
            }
        } catch (error) {
            setPOs(oldPos); // Rollback
            console.error("Network Fetch Error:", error);
            alert("Connection Error: Failed to reach server. Please check your network or if the server is running.");
        }
    };

    const addPOPayment = async (poId: string, data: any) => {
        // Optimistic Update
        const oldPos = [...pos];
        setPOs(prev => prev.map(p => {
            if (p.id === poId) {
                return {
                    ...p,
                    paidAmount: (Number(p.paidAmount) || 0) + (Number(data.amount) || 0),
                    transactions: [
                        { ...data, amount: Number(data.amount), id: 'temp-' + Date.now(), date: new Date().toISOString() },
                        ...(p.transactions || [])
                    ]
                } as any;
            }
            return p;
        }));

        try {
            const res = await fetch(`/api/po/${poId}/payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await fetchPOs();
                await fetchVendors();
            } else {
                setPOs(oldPos); // Rollback
                const error = await res.json();
                alert(`Payment Registration Failed: ${error.error || "Unknown Error"}`);
            }
        } catch (error) {
            setPOs(oldPos); // Rollback
            console.error(error);
        }
    };

    const addProduct = async (data: any) => {
        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const newProduct = await res.json();
            setProducts(prev => [newProduct, ...prev]);
        } else {
            const error = await res.json();
            alert(`Product Registry Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const updateProduct = async (id: string, data: any) => {
        const res = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const updated = await res.json();
            setProducts(prev => prev.map(p => p.id === id ? updated : p));
        } else {
            const error = await res.json();
            alert(`Update Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const deleteProduct = async (id: string) => {
        const res = await fetch(`/api/products/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setProducts(prev => prev.filter(p => p.id !== id));
        } else {
            const error = await res.json();
            alert(`Delete Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const resetSystem = async (confirmation: string) => {
        const res = await fetch("/api/config/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmation }),
        });
        if (res.ok) {
            // Clear all local states immediately
            setProducts([]);
            setOrders([]);
            setVendors([]);
            setContractors([]);
            setExpenses([]);
            setPOs([]);
            
            // Re-fetch configuration just in case, but keep staff as they are preserved
            await fetchConfig();
            
            alert("System Core Reset Successful. Dashboard is now at zero. All transactional data has been purged.");
        } else {
            const error = await res.json();
            alert(`Reset Failed: ${error.error || "Unknown Error"}`);
        }
    };

    const resyncVendor = useCallback(async (id: string) => {
        const res = await fetch(`/api/vendors/${id}/resync`, {
            method: "POST"
        });
        if (res.ok) {
            await fetchVendors();
            await fetchPOs();
        } else {
            const error = await res.json();
            alert(`Resync Failed: ${error.error || "Unknown Error"}`);
        }
    }, [fetchVendors, fetchPOs]);

    const triggerCloudSync = useCallback(async () => {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }));
        try {
            const res = await fetch("/api/system/backup");
            if (res.ok) {
                const data = await res.json();
                const timestamp = new Date().toISOString();

                // Redundant Data Layer: Store in local storage for offline recovery
                setTimeout(() => {
                    localStorage.setItem("biashara_matrix_redundant", JSON.stringify(data.matrix));
                    localStorage.setItem("last_cloud_sync", timestamp);
                }, 0);

                setSyncStatus({ lastSync: timestamp, isSyncing: false });
                console.log("Cloud Backup Sync Successful:", timestamp);
            }
        } catch (error) {
            console.error("Cloud Sync Failed:", error);
            setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        }
    }, []);

    const contextValue = useMemo(() => ({
        products, vendors, orders, contractors, staff, expenses, pos, isLoading, config,
        setProducts, addOrder, fetchProducts, fetchOrders, updateConfig,
        addVendor, updateVendor, deleteVendor, addContractor, addContractorTransaction, addStaff, updateStaff, deleteStaff, addExpense, addPO, updatePO, addProduct,
        updateProduct, deleteProduct, addPOPayment, resyncVendor, resetSystem, triggerCloudSync, syncStatus
    }), [
        products, vendors, orders, contractors, staff, expenses, pos, isLoading, config,
        setProducts, addOrder, fetchProducts, fetchOrders, updateConfig,
        addVendor, updateVendor, deleteVendor, addContractor, addContractorTransaction, addStaff, updateStaff, deleteStaff, addExpense, addPO, updatePO, addProduct,
        updateProduct, deleteProduct, addPOPayment, resyncVendor, resetSystem, triggerCloudSync, syncStatus
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within an AppProvider");
    return context;
}
