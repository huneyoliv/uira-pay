"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { ArrowUpRight, ArrowDownRight, X } from "lucide-react";

interface Transaction {
    id: string;
    type: string;
    amount: number;
    fee: number;
    status: string;
    currency: string;
    created_at: string;
    wallet?: {
        tenant_id: string;
        tenant?: { name: string; email: string };
    };
}

export function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, [page, typeFilter, statusFilter, startDate, endDate]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page), limit: "20" });
            if (typeFilter !== "all") params.set("type", typeFilter);
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);

            const res = await api.get(`/admin/transactions?${params}`);
            setTransactions(res.data.data); // Fixed: backend returns { data: [], meta: {} }
            setTotal(res.data.meta.total);
            setTotalPages(res.data.meta.last_page);
        } catch (err) {
            console.error("Failed to load transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setTypeFilter("all");
        setStatusFilter("all");
        setStartDate("");
        setEndDate("");
        setPage(1);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} total transactions</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[130px] rounded-xl h-9 text-xs bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="DEPOSIT">Deposits</SelectItem>
                            <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[130px] rounded-xl h-9 text-xs bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                        className="w-[130px] h-9 text-xs rounded-xl bg-white dark:bg-slate-900"
                    />
                    <span className="text-slate-400">-</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                        className="w-[130px] h-9 text-xs rounded-xl bg-white dark:bg-slate-900"
                    />

                    {(typeFilter !== "all" || statusFilter !== "all" || startDate || endDate) && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <X className="w-4 h-4 text-slate-500" />
                        </Button>
                    )}
                </div>
            </div>

            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="text-left px-6 py-3 font-medium">Type</th>
                                    <th className="text-left px-6 py-3 font-medium">Tenant</th>
                                    <th className="text-left px-6 py-3 font-medium">Amount</th>
                                    <th className="text-left px-6 py-3 font-medium">Status</th>
                                    <th className="text-left px-6 py-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            {[1, 2, 3, 4, 5].map((j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No transactions found</td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${tx.type === 'DEPOSIT'
                                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600'
                                                        : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'
                                                        }`}>
                                                        {tx.type === 'DEPOSIT'
                                                            ? <ArrowDownRight className="h-3.5 w-3.5" />
                                                            : <ArrowUpRight className="h-3.5 w-3.5" />
                                                        }
                                                    </div>
                                                    <span className="font-medium text-xs">{tx.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                                                {tx.wallet?.tenant?.name || "Unknown"}
                                                <div className="text-[10px] text-slate-400">{tx.wallet?.tenant?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-xs">
                                                {Number(tx.amount).toFixed(2)} {tx.currency}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.status === 'COMPLETED' || tx.status === 'PAID'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : tx.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {new Date(tx.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg text-xs">Previous</Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg text-xs">Next</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
