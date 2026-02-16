"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ArrowLeft, Shield, ShieldCheck, Wallet, User, Calendar, Globe, CreditCard } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface TenantDetail {
    id: string;
    name: string;
    email: string;
    doc_number: string;
    country: string;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED';
    twoFactorEnabled: boolean;
    isAdmin: boolean;
    created_at: string;
    wallets: Array<{
        id: string;
        currency: string;
        balance: number;
    }>;
}

export default function TenantDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [tenant, setTenant] = useState<TenantDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchTenantDetails();
        }
    }, [params.id]);

    const fetchTenantDetails = async () => {
        try {
            const res = await api.get(`/admin/tenants/${params.id}`);
            setTenant(res.data);
        } catch (err) {
            console.error("Failed to load tenant details:", err);
            alert("Failed to load tenant details");
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!confirm("Are you sure you want to suspend this tenant? They will not be able to login.")) return;
        try {
            await api.patch(`/admin/tenants/${params.id}/suspend`);
            fetchTenantDetails(); // Refresh status
        } catch (err) {
            console.error("Failed to suspend tenant:", err);
            alert("Failed to suspend tenant");
        }
    };

    // Note: Re-activate logic would be similar, checking if status is different or using a specific activate endpoint if one existed.
    // Given the API currently treats suspend as a toggle or sets to REJECTED, we might need an 'activate' button if they are REJECTED.
    const handleActivate = async () => {
        if (!confirm("Are you sure you want to activate this tenant?")) return;
        try {
            await api.patch(`/admin/tenants/${params.id}/approve`); // Re-using approve for activation as per current logic
            fetchTenantDetails();
        } catch (err) {
            console.error("Failed to activate tenant:", err);
            alert("Failed to activate tenant");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
    if (!tenant) return <div className="p-8 text-center text-slate-500">Tenant not found</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/tenants">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{tenant.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{tenant.email}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                tenant.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                            }`}>
                            {tenant.status}
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    {tenant.status === 'ACTIVE' && (
                        <Button variant="destructive" onClick={handleSuspend}>
                            Suspend Account
                        </Button>
                    )}
                    {tenant.status === 'REJECTED' && (
                        <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleActivate}>
                            Activate Account
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <Card className="rounded-2xl border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="h-2 bg-blue-500 w-full absolute top-0" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Document ID</label>
                                <p className="font-medium mt-1">{tenant.doc_number || "—"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Country</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Globe className="w-4 h-4 text-slate-400" />
                                    <span>{tenant.country || "—"}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Joined Date</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{format(new Date(tenant.created_at), 'PPP')}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">2FA Status</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {tenant.twoFactorEnabled ? (
                                        <div className="flex items-center text-green-600 gap-1.5 text-sm font-medium">
                                            <ShieldCheck className="w-4 h-4" /> Enabled
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-slate-400 gap-1.5 text-sm">
                                            <Shield className="w-4 h-4" /> Disabled
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallets Card */}
                <Card className="rounded-2xl border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="h-2 bg-emerald-500 w-full absolute top-0" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-500" />
                            Wallet Balances
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {tenant.wallets && tenant.wallets.length > 0 ? (
                                tenant.wallets.map(wallet => (
                                    <div key={wallet.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                                                {wallet.currency}
                                            </div>
                                            <span className="font-medium text-slate-700">{wallet.currency} Wallet</span>
                                        </div>
                                        <span className="text-lg font-bold text-emerald-600">
                                            {Number(wallet.balance).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-4">No wallets found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
