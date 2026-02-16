"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface Withdrawal {
    id: string;
    amount: number;
    fee: number;
    currency: string;
    status: string;
    network: string;
    address: string;
    created_at: string;
    wallet: {
        tenant_id: string;
        tenant: { name: string; email: string };
    };
}

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const res = await api.get("/admin/withdrawals/pending");
            setWithdrawals(res.data);
        } catch (err) {
            console.error("Failed to load withdrawals:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.patch(`/admin/withdrawals/${id}/approve`);
            setWithdrawals((prev) => prev.filter((w) => w.id !== id));
        } catch (err) {
            console.error("Failed to approve:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Rejection reason (optional):");
        setActionLoading(id);
        try {
            await api.patch(`/admin/withdrawals/${id}/reject`, { reason });
            setWithdrawals((prev) => prev.filter((w) => w.id !== id));
        } catch (err) {
            console.error("Failed to reject:", err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Pending Withdrawals</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {withdrawals.length} pending {withdrawals.length === 1 ? "withdrawal" : "withdrawals"}
                </p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : withdrawals.length === 0 ? (
                <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl">
                    <CardContent className="p-12 text-center">
                        <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No pending withdrawals</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {withdrawals.map((w) => (
                        <Card key={w.id} className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl">
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="font-bold text-base">{w.wallet?.tenant?.name}</p>
                                        <p className="text-xs text-slate-400">{w.wallet?.tenant?.email}</p>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-2">
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                {Number(w.amount).toFixed(2)} {w.currency}
                                            </span>
                                            <span>•</span>
                                            <span>{w.network}</span>
                                            <span>•</span>
                                            <span className="font-mono text-xs truncate max-w-[200px]">{w.address}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {new Date(w.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {/* Automatic withdrawals - Validated by system job */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleReject(w.id)}
                                            disabled={actionLoading === w.id}
                                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 rounded-lg px-4"
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Reject / Refund
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
