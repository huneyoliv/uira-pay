"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { FileText, User } from "lucide-react";

interface AuditLog {
    id: string;
    adminId: string;
    action: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    createdAt: string;
    admin?: {
        email: string;
    };
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/logs?limit=50');
            setLogs(res.data); // Assuming backend returns array directly or { data: [] }
            // Check controller: return this.adminService.getSystemLogs(Number(limit)); -> returns array promise
        } catch (err) {
            console.error("Failed to load system logs:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">System Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit trail of administrative actions</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs}>
                    Refresh
                </Button>
            </div>

            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="text-left px-6 py-3 font-medium">Date</th>
                                    <th className="text-left px-6 py-3 font-medium">Admin</th>
                                    <th className="text-left px-6 py-3 font-medium">Action</th>
                                    <th className="text-left px-6 py-3 font-medium">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            {[1, 2, 3, 4].map((j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No logs found</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <span className="text-xs font-medium">{log.admin?.email || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 max-w-md truncate">
                                                {JSON.stringify(log.details)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
