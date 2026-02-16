"use client";


import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Clock
} from "lucide-react";
import { getCountryData } from "@/lib/countries";


interface Metrics {
  totalSales: number;
  balance: number;
  sales24h: number;
}


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
    dashboard: "Painel",
    totalBalance: "Saldo Total",
    pendingBalance: "Saldo Pendente",
    recentTransactions: "Transações Recentes",
    newTransaction: "Nova Transação",
    status: "Status",
    date: "Data",
    amount: "Valor",
    type: "Tipo",
    pending: "Pendente",
    completed: "Concluído",
    failed: "Falhou",
    viewAll: "Ver todas",
    withdrawSoon: "Em breve você poderá realizar saques diretamente para sua conta Bancária!",
    withdraw: "Novo Pagamento",
    pendingUserMessage: "Sua conta está em análise. Você poderá visualizar seus dados, mas transações e saques estão desabilitados até a aprovação."
  },
  EN: {
    dashboard: "Dashboard",
    totalBalance: "Total Balance",
    pendingBalance: "Pending Balance",
    recentTransactions: "Recent Transactions",
    newTransaction: "New Transaction",
    status: "Status",
    date: "Date",
    amount: "Amount",
    type: "Type",
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    viewAll: "View all",
    withdrawSoon: "Soon you will be able to make withdrawals directly to your bank account!",
    withdraw: "New Payout",
    pendingUserMessage: "Your account is under review. You can view your data, but transactions and withdrawals are disabled until approval."
  }
};


export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('PT');
  const { user } = useAuthStore();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, transactionsRes] = await Promise.all([
          api.get("/metrics"),
          api.get("/transactions")
        ]);
        setMetrics(metricsRes.data);
        setTransactions(transactionsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchData();


    // Simple language detection
    const browserLang = navigator.language.toUpperCase();
    if (browserLang.startsWith('EN')) setLang('EN');
  }, []);


  const t = translations[lang as string] || translations['EN'];


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {user?.status === 'PENDING' && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <p className="text-amber-800 font-medium">
              {t.pendingUserMessage}
            </p>
          </div>
        </div>
      )}


      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t.dashboard}</h1>
          <p className="text-slate-500 mt-1">
            {new Date().toLocaleDateString(lang === 'PT' ? 'pt-BR' : 'en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="rounded-full h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold disabled:opacity-50"
            onClick={() => alert(t.withdrawSoon)}
            disabled={user?.status === 'PENDING'}
          >
            {t.withdraw}
          </Button>
          {user?.status === 'PENDING' ? (
            <Button disabled className="rounded-full h-11 px-6 bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-lg shadow-slate-200 opacity-50">
              <Plus className="mr-2 h-4 w-4" />
              {t.newTransaction}
            </Button>
          ) : (
            <Link href="/new-transaction">
              <Button className="rounded-full h-11 px-6 bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-lg shadow-slate-200">
                <Plus className="mr-2 h-4 w-4" />
                {t.newTransaction}
              </Button>
            </Link>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl shadow-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {t.totalBalance}
            </CardTitle>
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              $ {metrics?.balance.toLocaleString() ?? "0.00"}
            </div>
            <p className="text-xs font-semibold text-emerald-500 mt-2 flex items-center">
              <Plus className="h-3 w-3 mr-1" />
              12.5% from last month
            </p>
          </CardContent>
        </Card>


        <Card className="border-none shadow-xl shadow-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {t.pendingBalance}
            </CardTitle>
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              $ 1,240.00
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">
              Expected in next 48h
            </p>
          </CardContent>
        </Card>


        <Card className="border-none shadow-xl shadow-slate-100 bg-indigo-600 text-white lg:col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-indigo-100 uppercase tracking-wider">
              Transaction Volume
            </CardTitle>
            <div className="h-10 w-10 bg-indigo-500/30 rounded-xl flex items-center justify-center">
              <MoreHorizontal className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              $ {metrics?.totalSales.toLocaleString() ?? "0.00"}
            </div>
            <p className="text-xs font-semibold text-indigo-200 mt-2">
              Lifetime processing
            </p>
          </CardContent>
        </Card>
      </div>


      <Card className="border-none shadow-xl shadow-slate-100 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 px-6 py-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">
              {t.recentTransactions}
            </CardTitle>
            <Button variant="ghost" className="text-indigo-600 font-bold hover:text-indigo-700 hover:bg-indigo-50">
              {t.viewAll}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t.status}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t.date}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t.amount}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t.type}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                        tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {tx.status === 'COMPLETED' ? t.completed : tx.status === 'PENDING' ? t.pending : t.failed}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      $ {tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {tx.type === 'SALE' ? (
                          <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <ArrowUpRight className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {tx.type}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
            }
