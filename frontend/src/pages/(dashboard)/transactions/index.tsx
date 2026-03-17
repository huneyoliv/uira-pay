"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { getCountryData } from "@/lib/countries";

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    currency: string;
    date: string;
}

const translations: any = {
    PT: {
        title: "Transações",
        subtitle: "Visualize e gerencie todo o histórico financeiro.",
        filter: "Filtrar",
        exportCSV: "Exportar CSV",
        searchPlaceholder: "Buscar por ID, cliente ou valor...",
        type: "Tipo",
        id: "ID da Transação",
        date: "Data",
        status: "Status",
        amount: "Valor",
        noTransactions: "Nenhuma transação encontrada.",
        deposit: "Recebimento",
        withdrawal: "Saque",
    },
    EN: {
        title: "Transactions",
        subtitle: "View and manage your entire financial history.",
        filter: "Filter",
        exportCSV: "Export CSV",
        searchPlaceholder: "Search by ID, customer or amount...",
        type: "Type",
        id: "Transaction ID",
        date: "Date",
        status: "Status",
        amount: "Amount",
        noTransactions: "No transactions found.",
        deposit: "Deposit",
        withdrawal: "Withdrawal",
    },
    FR: {
        title: "Transactions",
        subtitle: "Consultez et gérez tout votre historique financier.",
        filter: "Filtrer",
        exportCSV: "Exporter CSV",
        searchPlaceholder: "Rechercher par ID, client ou montant...",
        type: "Type",
        id: "ID Transaction",
        date: "Date",
        status: "Statut",
        amount: "Montant",
        noTransactions: "Aucune transaction trouvée.",
        deposit: "Dépôt",
        withdrawal: "Retrait",
    },
    ES: {
        title: "Transacciones",
        subtitle: "Visualice y administre todo su historial financiero.",
        filter: "Filtrar",
        exportCSV: "Exportar CSV",
        searchPlaceholder: "Buscar por ID, cliente o monto...",
        type: "Tipo",
        id: "ID Transacción",
        date: "Fecha",
        status: "Estado",
        amount: "Monto",
        noTransactions: "No se encontraron transacciones.",
        deposit: "Depósito",
        withdrawal: "Retiro",
    }
};

export function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state) => state.user);

    // Determine language
    const countryData = user?.country ? getCountryData(user.country) : { lang: 'PT' };
    const lang = user?.language || countryData.lang || 'PT';
    const localeMap: Record<string, string> = { PT: 'pt-BR', EN: 'en-US', ES: 'es-ES', FR: 'fr-FR' };
    const locale = localeMap[lang as string] || 'pt-BR';
    const t = translations[lang as string] || translations['EN'];

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get("/tenant/dashboard/transactions");
                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    const handleExportCSV = () => {
        if (transactions.length === 0) return;

        const headers = [t.type, t.id, t.date, t.status, t.amount, 'Currency'];
        const rows = transactions.map((tx) => [
            tx.type === 'DEPOSIT' ? t.deposit : t.withdrawal,
            tx.id,
            new Date(tx.date).toLocaleDateString(locale) + ' ' + new Date(tx.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
            tx.status,
            tx.amount.toString(),
            tx.currency,
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-full h-11 px-4 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Filter className="h-4 w-4 mr-2" />
                        {t.filter}
                    </Button>
                    <Button
                        className="rounded-full h-11 px-6 bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white font-semibold shadow-lg shadow-black/20"
                        onClick={handleExportCSV}
                        disabled={transactions.length === 0}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {t.exportCSV}
                    </Button>
                </div>
            </div>

            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px] overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t.searchPlaceholder}
                                className="pl-11 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus-visible:ring-black dark:focus-visible:ring-white"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-4 p-4">
                        {transactions.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">{t.noTransactions}</div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {tx.type === 'DEPOSIT' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">{tx.type === 'DEPOSIT' ? t.deposit : t.withdrawal}</div>
                                                <div className="text-xs text-slate-400 font-mono">{tx.id.substring(0, 8)}...</div>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'} {
                                                ['USDT', 'USDC', 'BTC', 'ETH'].includes(tx.currency)
                                                    ? `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(tx.amount)} ${tx.currency}`
                                                    : new Intl.NumberFormat(locale, { style: "currency", currency: tx.currency }).format(tx.amount)
                                            }
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-50">
                                        <span>{new Date(tx.date).toLocaleDateString(locale)} {new Date(tx.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className={`px-2 py-0.5 rounded-full font-medium ${tx.status === 'COMPLETED' || tx.status === 'PAID'
                                            ? 'bg-green-100 text-green-800'
                                            : tx.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                <tr>
                                    <th className="px-8 py-4">{t.type}</th>
                                    <th className="px-8 py-4">{t.id}</th>
                                    <th className="px-8 py-4">{t.date}</th>
                                    <th className="px-8 py-4">{t.status}</th>
                                    <th className="px-8 py-4 text-right">{t.amount}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                                            {t.noTransactions}
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'
                                                        }`}>
                                                        {tx.type === 'DEPOSIT' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                                    </div>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                        {tx.type === 'DEPOSIT' ? t.deposit : t.withdrawal}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                                {tx.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-8 py-4 text-slate-500 dark:text-slate-400">
                                                {new Date(tx.date).toLocaleDateString(locale)} <span className="text-slate-400 text-xs ml-1">{new Date(tx.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'COMPLETED' || tx.status === 'PAID'
                                                    ? 'bg-green-100 text-green-800'
                                                    : tx.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`px-8 py-4 text-right font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900 dark:text-slate-100'
                                                }`}>
                                                {tx.type === 'DEPOSIT' ? '+' : '-'} {
                                                    ['USDT', 'USDC', 'BTC', 'ETH'].includes(tx.currency)
                                                        ? `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(tx.amount)} ${tx.currency}`
                                                        : new Intl.NumberFormat(locale, { style: "currency", currency: tx.currency }).format(tx.amount)
                                                }
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
