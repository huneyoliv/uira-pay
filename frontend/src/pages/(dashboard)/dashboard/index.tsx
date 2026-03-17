"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
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
    title: "Visão Geral",
    subtitle: "Controle financeiro completo para sua empresa.",
    importData: "Importar Operações",
    newTransaction: "Nova Operação",
    withdraw: "Novo Pagamento",
    totalRevenue: "Receita Total",
    updatedNow: "Atualizado agora",
    tenantBalance: "Saldo Disponível",
    totalAccumulated: "Total acumulado",
    sales24h: "Volume 24h",
    onTime: "Em tempo real",
    revenueAnalysis: "Análise de Fluxo",
    newReport: "+ Relatório",
    chartComingSoon: "Gráfico de fluxo em breve.",
    waitingHistory: "Aguardando histórico.",
    recentTransactions: "Últimas Operações",
    noTransactions: "Nenhuma operação recente.",
    deposit: "Entrada",
    withdrawal: "Saída",
    viewAll: "Ver Extrato Completo",
    importSoon: "Importação em breve!",
    withdrawSoon: "Pagamentos em breve!",
  },
  EN: {
    title: "Overview",
    subtitle: "Complete financial control for your business.",
    importData: "Import Operations",
    newTransaction: "New Operation",
    withdraw: "New Payout",
    totalRevenue: "Total Revenue",
    updatedNow: "Updated just now",
    tenantBalance: "Available Balance",
    totalAccumulated: "Total accumulated",
    sales24h: "Volume 24h",
    onTime: "Real-time",
    revenueAnalysis: "Cash Flow Analysis",
    newReport: "+ New Report",
    chartComingSoon: "Cash flow chart coming soon.",
    waitingHistory: "Waiting for history.",
    recentTransactions: "Recent Operations",
    noTransactions: "No recent operations.",
    deposit: "Inflow",
    withdrawal: "Outflow",
    viewAll: "View Full Statement",
    importSoon: "Import coming soon!",
    withdrawSoon: "Payouts coming soon!",
  },
  FR: {
    title: "Vue d'ensemble",
    subtitle: "Contrôle financier complet pour votre entreprise.",
    importData: "Importer Opérations",
    newTransaction: "Nouvelle Opération",
    withdraw: "Nouveau Paiement",
    totalRevenue: "Recettes Totales",
    updatedNow: "Mis à jour",
    tenantBalance: "Solde Disponible",
    totalAccumulated: "Total cumulé",
    sales24h: "Volume 24h",
    onTime: "Temps réel",
    revenueAnalysis: "Analyse des Flux",
    newReport: "+ Rapport",
    chartComingSoon: "Graphique de flux bientôt.",
    waitingHistory: "En attente d'historique.",
    recentTransactions: "Dernières Opérations",
    noTransactions: "Aucune opération récente.",
    deposit: "Entrée",
    withdrawal: "Sortie",
    viewAll: "Voir Tout",
    importSoon: "Importation bientôt !",
    withdrawSoon: "Paiements bientôt !",
  },
  ES: {
    title: "Visión General",
    subtitle: "Control financiero completo para su empresa.",
    importData: "Importar Operaciones",
    newTransaction: "Nueva Operación",
    withdraw: "Nuevo Pago",
    totalRevenue: "Ingresos Totales",
    updatedNow: "Actualizado ahora",
    tenantBalance: "Saldo Disponible",
    totalAccumulated: "Total acumulado",
    sales24h: "Volumen 24h",
    onTime: "En tiempo real",
    revenueAnalysis: "Análisis de Flujo",
    newReport: "+ Informe",
    chartComingSoon: "Gráfico próximamente.",
    waitingHistory: "Esperando historial.",
    recentTransactions: "Últimas Operaciones",
    noTransactions: "Ninguna operación reciente.",
    deposit: "Entrada",
    withdrawal: "Salida",
    viewAll: "Ver Extracto",
    importSoon: "¡Importación pronto!",
    withdrawSoon: "¡Pagos pronto!",
  }
};

export function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  // Determine language based on user preference or country
  const countryData = user?.country ? getCountryData(user.country) : { lang: 'PT' };
  const lang = user?.language || countryData.lang || 'PT';
  const localeMap: Record<string, string> = { PT: 'pt-BR', EN: 'en-US', ES: 'es-ES', FR: 'fr-FR' };
  const locale = localeMap[lang as string] || 'pt-BR';
  const t = translations[lang as string] || translations['EN'];
  const currency = user?.fiatCurrency || 'BRL';
  // Use tenant's preferred currency (USDT/USDC), defaulting to USDT if not set
  const cryptoCurrency = user?.default_currency || 'USDT';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, transactionsRes] = await Promise.all([
          api.get("/tenant/dashboard/metrics"),
          api.get("/tenant/dashboard/transactions"),
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
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
            <Button
              disabled
              className="rounded-full h-11 px-6 bg-slate-200 text-slate-400 font-semibold cursor-not-allowed"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.newTransaction}
            </Button>
          ) : (
            <Link to="/new-transaction">
              <Button
                className="rounded-full h-11 px-6 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-semibold shadow-lg shadow-black/20 dark:shadow-white/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t.newTransaction}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Primary Card - Total Revenue */}
        <Card className="bg-black dark:bg-slate-800 text-white border-none shadow-xl shadow-black/20 dark:shadow-slate-900/50 rounded-[32px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <CardContent className="relative z-10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-100 dark:text-gray-300">{t.totalRevenue}</span>
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">
              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(metrics?.totalSales || 0)} <span className="text-lg text-gray-300 dark:text-gray-400 font-medium">{cryptoCurrency}</span>
            </div>
            <div className="flex items-center text-xs text-green-100 bg-white/10 w-fit px-2 py-1 rounded-full">
              <Plus className="h-3 w-3 mr-1" />
              {t.updatedNow}
            </div>
          </CardContent>
        </Card>

        {/* Secondary Card - Tenant Balance */}
        <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{t.tenantBalance}</span>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(metrics?.balance || 0)} <span className="text-lg text-slate-500 dark:text-slate-400 font-medium">{cryptoCurrency}</span>
            </div>
            <div className="flex items-center text-xs text-slate-400 border border-slate-100 w-fit px-2 py-1 rounded-full">
              <Plus className="h-3 w-3 mr-1" />
              {t.totalAccumulated}
            </div>
          </CardContent>
        </Card>

        {/* Secondary Card - Sales 24h */}
        <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{t.sales24h}</span>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(metrics?.sales24h || 0)} <span className="text-lg text-slate-500 dark:text-slate-400 font-medium">{cryptoCurrency}</span>
            </div>
            <div className="flex items-center text-xs text-slate-400 border border-slate-100 w-fit px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              {t.onTime}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Analytics Chart Placeholder */}
        <Card className="col-span-2 bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px] p-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{t.revenueAnalysis}</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="rounded-full text-xs h-8">
              {t.newReport}
            </Button>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
            <div className="text-center">
              <div className="mb-2">📊</div>
              <p>{t.chartComingSoon}</p>
              <p className="text-xs text-slate-300">{t.waitingHistory}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card className="col-span-1 bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px] p-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{t.recentTransactions}</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-2">
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">{t.noTransactions}</p>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${tx.type === 'DEPOSIT' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30'
                        }`}>
                        {tx.type === 'DEPOSIT' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.type === 'DEPOSIT' ? t.deposit : t.withdrawal}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString(locale)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                        {tx.type === 'DEPOSIT' ? '+' : '-'} {
                          ['USDT', 'USDC', 'BTC', 'ETH'].includes(tx.currency)
                            ? `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(tx.amount)} ${tx.currency}`
                            : new Intl.NumberFormat(locale, { style: "currency", currency: tx.currency }).format(tx.amount)
                        }
                      </p>
                      <p className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 w-fit ml-auto mt-1">
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to="/transactions" className="block mt-6">
              <Button variant="outline" className="w-full rounded-2xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200">
                {t.viewAll}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
