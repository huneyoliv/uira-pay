"use client";

import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    CreditCard,
    Settings,
    HelpCircle,
    LogOut,
    Search,
    Bell,
    Zap,
    Menu,
    X,
    ArrowDownRight,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { useSignedUrl } from "@/hooks/use-signed-url";

import { PendingRequirementsModal } from "@/components/pending-requirements-modal";
import { DocumentRequestModal } from "@/components/document-request-modal";
import { NewTermsBanner } from "@/components/new-terms-banner";

export function DashboardLayout() {
    const location = useLocation();
    const pathname = location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            navigate('/login');
        }
    }, [hasHydrated, isAuthenticated, navigate]);

    if (!hasHydrated) {
        return null;
    }

    const translations: any = {
        PT: {
            dashboard: "Visão Geral",
            transactions: "Transações",
            settings: "Configurações",
            help: "Suporte",
            menu: "Menu",
            logout: "Sair",
            searchPlaceholder: "Buscar transações, parceiros...",
            withdrawals: "Pagamentos"
        },
        EN: {
            dashboard: "Overview",
            transactions: "Transactions",
            settings: "Settings",
            help: "Support",
            menu: "Menu",
            logout: "Logout",
            searchPlaceholder: "Search transactions, partners...",
            withdrawals: "Payouts"
        },
        FR: {
            dashboard: "Vue d'ensemble",
            transactions: "Transactions",
            settings: "Paramètres",
            help: "Support",
            menu: "Menu",
            logout: "Déconnexion",
            searchPlaceholder: "Rechercher transactions, partenaires...",
            withdrawals: "Paiements"
        },
        ES: {
            dashboard: "Visión General",
            transactions: "Transacciones",
            settings: "Configuración",
            help: "Soporte",
            menu: "Menú",
            logout: "Cerrar Sesión",
            searchPlaceholder: "Buscar transacciones, socios...",
            withdrawals: "Pagos"
        }
    };

    const lang = user?.language || "PT";
    const t = translations[lang] || translations["PT"];

    const navItems = [
        { name: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
        { name: t.transactions, href: "/transactions", icon: CreditCard },
        { name: t.withdrawals, href: "/withdrawals", icon: ArrowDownRight },
        { name: t.settings, href: "/settings", icon: Settings },
        { name: t.help, href: "/help", icon: HelpCircle },
    ];

    const profilePhotoUrl = useSignedUrl(user?.profilePhotoUrl);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <PendingRequirementsModal />
            <DocumentRequestModal />
            <aside className="hidden lg:flex w-[280px] flex-col bg-white dark:bg-[#0B0F19] border-r border-slate-100 dark:border-slate-800 fixed h-full z-20 transition-colors duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-black dark:text-white mb-12">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black">
                            <Zap className="h-6 w-6" />
                        </div>
                        <span>UIRÁ</span>
                    </div>

                    <nav className="space-y-2">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">{t.menu}</div>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isPending = user?.status === "PENDING";
                            const isRestricted = isPending && (item.href === "/transactions" || item.href === "/withdrawals");

                            if (isRestricted) {
                                return (
                                    <div
                                        key={item.href}
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50"
                                        title="Account pending approval"
                                    >
                                        <item.icon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive
                                        ? "bg-black text-white shadow-lg shadow-black/20 dark:bg-white dark:text-black dark:shadow-white/10"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? "text-white dark:text-black" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
                                    <span className="font-medium">{item.name}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/30 dark:bg-black/30" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-8">
                    <button
                        onClick={() => useAuthStore.getState().logout()}
                        className="flex items-center gap-3 px-4 py-3 mt-6 text-slate-400 hover:text-red-500 transition-colors w-full"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">{t.logout}</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col lg:pl-[280px]">
                <header className="h-24 px-8 flex items-center justify-between bg-[#F8FAFC]/80 dark:bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex items-center gap-4 lg:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu className="h-6 w-6 text-slate-600" />
                        </Button>
                        <span className="font-bold text-xl text-black dark:text-white">UIRÁ</span>
                    </div>

                    <div className="hidden lg:flex items-center max-w-md w-full">
                        {pathname === "/dashboard" && (
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder={t.searchPlaceholder}
                                    className="pl-11 h-12 rounded-full border-none bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-400 border border-slate-200">⌘ K</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-[#0B0F19] h-12 w-12 text-slate-400 hover:text-black shadow-sm hover:bg-white dark:hover:bg-slate-800 dark:hover:text-white transition-all">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </Button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name || "Usuário"}</p>
                                <p className="text-xs text-slate-400">{user?.email || ""}</p>
                            </div>
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={profilePhotoUrl} />
                                <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">
                                    {user?.name?.substring(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-8 pb-8 overflow-y-auto">
                    {user?.status === 'PENDING' && (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-200">
                            <Clock className="h-5 w-5 flex-shrink-0" />
                            <div className="text-sm font-medium">
                                {lang === 'PT' ? 'Sua conta está aguardando aprovação. Algumas funcionalidades estão limitadas.' : 'Your account is pending approval. Some features are limited.'}
                            </div>
                        </div>
                    )}
                    <NewTermsBanner />
                    <Outlet />
                </main>
            </div>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute left-0 top-0 h-full w-[280px] bg-white dark:bg-[#0B0F19] p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-bold text-xl text-black dark:text-white">{t.menu}</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const isPending = user?.status === "PENDING";
                                const isRestricted = isPending && (item.href === "/transactions" || item.href === "/withdrawals");

                                if (isRestricted) {
                                    return (
                                        <div
                                            key={item.href}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 dark:text-slate-600 opacity-50"
                                        >
                                            <item.icon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon className={`h-5 w-5 ${isActive ? "text-white dark:text-black" : ""}`} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                            <button
                                onClick={() => useAuthStore.getState().logout()}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 w-full transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">{t.logout}</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}
