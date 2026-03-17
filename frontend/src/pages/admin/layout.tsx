"use client";

import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, ArrowDownRight,
    LogOut, Zap, ArrowLeft, FileText, Menu, X, Bell
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminLayout() {
    const pathname = useLocation().pathname;
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (hasHydrated && (!user || !user.isAdmin)) {
            navigate("/dashboard");
        }
    }, [hasHydrated, user, navigate]);

    if (!hasHydrated || !user?.isAdmin) return null;

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Tenants", href: "/admin/tenants", icon: Users },
        { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
        { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowDownRight },
        { name: "Legal Docs", href: "/admin/terms", icon: FileText },
        { name: "System Logs", href: "/admin/logs", icon: FileText },
    ];

    const profilePhotoUrl = user?.profilePhotoUrl || undefined;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-[280px] flex-col bg-white dark:bg-[#0B0F19] border-r border-slate-100 dark:border-slate-800 fixed h-full z-20 transition-colors duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-black dark:text-white mb-12">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black">
                            <Zap className="h-6 w-6" />
                        </div>
                        <span>UIRÁ</span>
                        <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-bold ml-1">ADMIN</span>
                    </div>

                    <nav className="space-y-2">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</div>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
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
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Back to App</span>
                    </Link>
                    <button
                        onClick={() => useAuthStore.getState().logout()}
                        className="flex items-center gap-3 px-4 py-3 mt-2 text-slate-400 hover:text-red-500 transition-colors w-full"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:pl-[280px]">
                {/* Header */}
                <header className="h-24 px-8 flex items-center justify-between bg-[#F8FAFC] dark:bg-[#020617] sticky top-0 z-10 transition-colors duration-300">
                    <div className="flex items-center gap-4 lg:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu className="h-6 w-6 text-slate-600" />
                        </Button>
                        <span className="font-bold text-xl text-black dark:text-white">UIRÁ</span>
                        <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                    </div>

                    <div className="hidden lg:block" />

                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-[#0B0F19] h-12 w-12 text-slate-400 hover:text-black shadow-sm hover:bg-white dark:hover:bg-slate-800 dark:hover:text-white transition-all">
                            <Bell className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name || "Admin"}</p>
                                <p className="text-xs text-slate-400">{user?.email || ""}</p>
                            </div>
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={profilePhotoUrl} />
                                <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">
                                    {user?.name?.substring(0, 2).toUpperCase() || "A"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                    <Outlet />
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute left-0 top-0 h-full w-[280px] bg-white dark:bg-[#0B0F19] p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-xl text-black dark:text-white">UIRÁ</span>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
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
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="font-medium">Back to App</span>
                            </Link>
                            <button
                                onClick={() => useAuthStore.getState().logout()}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 w-full transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}
