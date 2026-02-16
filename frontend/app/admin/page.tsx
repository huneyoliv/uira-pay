"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Users, CreditCard, Wallet, ArrowDownRight, TrendingUp, Activity, DollarSign, Bitcoin } from "lucide-react";

interface DashboardMetrics {
    totalTenants: number;
    totalTransactions: number;
    totalVolume: number;
    pendingWithdrawals: number;
    activeTenants: number;
    recentTenants: Array<{
        id: string;
        name: string;
        email: string;
        created_at: string;
    }>;
}

interface Balances {
    efi: { balance: number; currency: string };
    binance: {
        assets: Array<{ asset: string; free: string; locked: string }>;
        totalUSDT: number;
    };
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [balances, setBalances] = useState<Balances | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [metricsRes, balancesRes] = await Promise.all([
                api.get("/admin/dashboard"),
                api.get("/admin/balances").catch(() => ({ data: null })),
            ]);
            setMetrics(metricsRes.data);
            setBalances(balancesRes.data);
        } catch (err) {
            console.error("Failed to load dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: "Total Tenants",
            value: metrics?.totalTenants || 0,
            icon: Users,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        },
        {
            title: "Active Tenants",
            value: metrics?.activeTenants || 0,
            icon: Activity,
            color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        },
        {
            title: "Total Transactions",
            value: metrics?.totalTransactions || 0,
            icon: CreditCard,
            color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        },
        {
            title: "Pending Withdrawals",
            value: metrics?.pendingWithdrawals || 0,
            icon: ArrowDownRight,
            color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform overview and metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                                </div>
                                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Efí Balance */}
                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-white/10">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <p className="text-emerald-100 text-sm font-medium">Efí (PIX) Balance</p>
                        </div>
                        <p className="text-3xl font-bold">
                            R$ {(balances?.efi?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>

                {/* Binance Balance */}
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-white/10">
                                <Bitcoin className="h-5 w-5" />
                            </div>
                            <p className="text-amber-100 text-sm font-medium">Binance Balance</p>
                        </div>
                        <p className="text-3xl font-bold">
                            $ {(balances?.binance?.totalUSDT || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-lg opacity-70 ml-1">USDT</span>
                        </p>
                        {balances?.binance?.assets && balances.binance.assets.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {balances.binance.assets.slice(0, 5).map((a) => (
                                    <span key={a.asset} className="text-xs bg-white/10 px-2 py-1 rounded-lg">
                                        {a.asset}: {parseFloat(a.free).toFixed(4)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Volume Card */}
            <Card className="bg-black dark:bg-slate-800 text-white border-none rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <p className="text-slate-300 text-sm font-medium">Total Volume (Deposits)</p>
                    </div>
                    <p className="text-4xl font-bold mt-2">
                        {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(metrics?.totalVolume || 0)} <span className="text-lg opacity-70">USDT</span>
                    </p>
                </CardContent>
            </Card>

            {/* Recent Tenants */}
            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent Tenants</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics?.recentTenants?.map((tenant) => (
                            <div key={tenant.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-none">
                                <div>
                                    <p className="font-medium text-sm">{tenant.name}</p>
                                    <p className="text-xs text-slate-400">{tenant.email}</p>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {new Date(tenant.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                        {(!metrics?.recentTenants || metrics.recentTenants.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">No tenants yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
