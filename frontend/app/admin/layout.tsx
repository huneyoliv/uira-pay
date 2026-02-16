"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Users, CreditCard, ArrowDownRight,
    LogOut, Zap, ArrowLeft
} from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);

    useEffect(() => {
        if (hasHydrated && (!user || !user.isAdmin)) {
            router.push("/dashboard");
        }
    }, [hasHydrated, user, router]);

    if (!hasHydrated || !user?.isAdmin) return null;

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Tenants", href: "/admin/tenants", icon: Users },
        { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
        { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowDownRight },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-sans text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className="w-[260px] bg-white dark:bg-[#0B0F19] border-r border-slate-100 dark:border-slate-800 hidden md:flex flex-col fixed h-full z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-black dark:text-white mb-8">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                            <Zap className="h-5 w-5" />
                        </div>
                        <span>UIRÁ</span>
                        <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-bold ml-1">ADMIN</span>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${isActive
                                        ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <item.icon className="h-4.5 w-4.5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium">Back to App</span>
                    </Link>
                    <button
                        onClick={() => useAuthStore.getState().logout()}
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors w-full text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:pl-[260px] p-6 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
