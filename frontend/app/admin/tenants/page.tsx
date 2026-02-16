"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Search, Shield, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface Tenant {
    id: string;
    name: string;
    email: string;
    doc_number: string;
    default_currency: string;
    country: string;
    twoFactorEnabled: boolean;
    isAdmin: boolean;
    created_at: string;
    status?: 'PENDING' | 'ACTIVE' | 'REJECTED';
    wallets: Array<{ balance: number; currency: string }>;
}

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenants();
    }, [page, search]);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/tenants?page=${page}&limit=15&search=${search}`);
            setTenants(res.data.tenants);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("Failed to load tenants:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm("Are you sure you want to approve this tenant?")) return;
        try {
            await api.patch(`/admin/tenants/${id}/approve`);
            fetchTenants();
        } catch (err) {
            console.error("Failed to approve tenant:", err);
            alert("Failed to approve tenant");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this tenant?")) return;
        try {
            await api.patch(`/admin/tenants/${id}/reject`);
            fetchTenants();
        } catch (err) {
            console.error("Failed to reject tenant:", err);
            alert("Failed to reject tenant");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Tenants</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} registered tenants</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name or email..."
                        className="pl-9 h-10 rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                </div>
            </div>

            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="text-left px-6 py-3 font-medium">Name</th>
                                    <th className="text-left px-6 py-3 font-medium">Email</th>
                                    <th className="text-left px-6 py-3 font-medium">Status</th>
                                    <th className="text-left px-6 py-3 font-medium">Balance</th>
                                    <th className="text-left px-6 py-3 font-medium">2FA</th>
                                    <th className="text-left px-6 py-3 font-medium">Joined</th>
                                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : tenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            No tenants found
                                        </td>
                                    </tr>
                                ) : (
                                    tenants.map((tenant) => (
                                        <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/tenants/${tenant.id}`} className="font-medium hover:underline">
                                                    {tenant.name}
                                                    {tenant.isAdmin && <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{tenant.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${tenant.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : tenant.status === 'REJECTED'
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {tenant.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm">
                                                {tenant.wallets?.[0]
                                                    ? `${Number(tenant.wallets[0].balance).toFixed(2)} ${tenant.wallets[0].currency}`
                                                    : "—"
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                {tenant.twoFactorEnabled ? (
                                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Shield className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {new Date(tenant.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {tenant.status === 'PENDING' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleApprove(tenant.id)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleReject(tenant.id)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg text-xs">
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg text-xs">
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
