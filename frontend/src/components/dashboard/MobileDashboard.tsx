"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ArrowUpRight, ArrowDownRight, Bell, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from 'react-router-dom';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    currency: string;
    date: string;
    counterpart?: string;
}

export function MobileDashboard() {
    const { t } = useLanguage();
    const user = useAuthStore((state) => state.user);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, txRes] = await Promise.all([
                    api.get("/tenant/dashboard/metrics"),
                    api.get("/tenant/dashboard/transactions?limit=5"),
                ]);
                setBalance(metricsRes.data.balance || 0);
                setTransactions(txRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="w-full min-h-screen bg-white text-black p-4 pb-24 overflow-y-auto relative font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {user?.name?.substring(0, 2).toUpperCase() || "ME"}
                    </div>
                    <span className="font-semibold text-sm">Hi, {user?.name?.split(' ')[0]}</span>
                </div>
                <div className="flex gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <Settings className="w-5 h-5 text-gray-600" />
                </div>
            </div>

            {/* Balance Section */}
            <div className="flex justify-between items-center mb-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-bold">$</span>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">{t.homepage.balance}</div>
                        <div className="font-bold text-2xl">
                            {['USDT', 'USDC', 'BTC', 'ETH'].includes(user?.default_currency || 'USD')
                                ? `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(balance)} ${user?.default_currency || 'USD'}`
                                : new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.default_currency || 'USD' }).format(balance)
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Main Card */}
                <div className="bg-black text-white p-6 rounded-2xl shadow-xl shadow-black/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="text-xs opacity-70 mb-8">{t.homepage.mainCard}</div>
                    <div className="flex justify-between items-end mt-4 relative z-10">
                        <div className="font-mono tracking-widest text-lg">**** **** **** 4589</div>
                        <div className="font-bold italic text-xl">VISA</div>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/dashboard/withdrawals" className="bg-gray-100 p-4 rounded-xl text-center hover:bg-gray-200 transition-colors cursor-pointer group">
                        <div className="text-sm font-bold text-gray-800 group-hover:scale-105 transition-transform">{t.homepage.send}</div>
                    </Link>
                    <button className="bg-gray-100 p-4 rounded-xl text-center hover:bg-gray-200 transition-colors cursor-pointer group">
                        <div className="text-sm font-bold text-gray-800 group-hover:scale-105 transition-transform">{t.homepage.request}</div>
                    </button>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t.homepage.recent}</div>
                        <Link to="/dashboard/transactions" className="text-xs text-blue-600 font-semibold">View All</Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-4 text-xs text-gray-400">{t.common.loading}</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-4 text-xs text-gray-400">{t.transactions.noTransactions}</div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            {tx.type === 'DEPOSIT' ?
                                                <ArrowDownRight className="w-4 h-4 text-green-600" /> :
                                                <ArrowUpRight className="w-4 h-4 text-gray-600" />
                                            }
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{tx.type === 'DEPOSIT' ? t.transactions.deposit : t.transactions.withdrawal}</div>
                                            <div className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-black'}`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}
                                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(tx.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
