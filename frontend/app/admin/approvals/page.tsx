"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { format } from "date-fns";

interface Tenant {
    id: string;
    name: string;
    doc_number: string;
    email: string;
    created_at: string;
}

export default function ApprovalsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                // Assuming you have an axios instance setup to handle auth token, otherwise you need to add header manually
                // For simplicity here, assuming a global interceptor or similar, or just try fetching
                const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
                const response = await axios.get("https://api.swaptune.me/admin/approvals", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTenants(response.data);
            } catch (error) {
                console.error("Failed to fetch approvals", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pending Approvals</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tenant.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{tenant.doc_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{tenant.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{format(new Date(tenant.created_at), 'dd/MM/yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link href={`/admin/approvals/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {tenants.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No pending approvals</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
