import React from 'react';
import {
    Bell,
    Menu,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MoreHorizontal
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

export function MobileDashboardMockup() {
    const { t } = useLanguage();

    return (
        <div className="w-full h-full bg-slate-50 text-slate-900 p-4 overflow-hidden relative font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-1">
                        <Menu className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="font-bold text-lg text-black">UIRÁ</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Bell className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[1px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                            <Image
                                src="/avatar-placeholder.png"
                                alt="User Profile"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{t.dashboardMockup.title}</h1>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[90%]">
                    {t.dashboardMockup.subtitle}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
                <button className="flex-1 bg-white border border-slate-100 rounded-full py-2.5 px-4 text-xs font-semibold text-slate-600 shadow-sm">
                    {t.dashboardMockup.withdraw}
                </button>
                <button className="flex-[1.5] bg-black rounded-full py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                    <Plus className="w-3 h-3" />
                    {t.dashboardMockup.newTransaction}
                </button>
            </div>

            <div className="space-y-4 pb-20 overflow-y-auto no-scrollbar h-[calc(100%-180px)]">
                {/* Total Revenue Card (Black) */}
                <div className="bg-black text-white p-5 rounded-[24px] shadow-xl shadow-black/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-3xl"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="text-xs font-medium text-green-100">{t.dashboardMockup.totalRevenue}</div>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    <div className="relative z-10 mb-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">{t.dashboardMockup.totalRevenueValue}</span>
                            <span className="text-sm font-medium text-green-100">USDT</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 relative z-10">
                        <Plus className="w-2 h-2 text-green-100" />
                        <span className="text-[10px] text-green-100">{t.dashboardMockup.updatedNow}</span>
                    </div>
                </div>

                {/* Available Balance Card (White) */}
                <div className="bg-white p-5 rounded-[24px] shadow-sm relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-medium text-slate-500">{t.dashboardMockup.availableBalance}</div>
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">{t.dashboardMockup.availableBalanceValue}</span>
                            <span className="text-sm font-medium text-slate-500">USDT</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1 border border-slate-100 rounded-full px-2 py-1">
                        <Plus className="w-2 h-2 text-slate-400" />
                        <span className="text-[10px] text-slate-400">{t.dashboardMockup.totalAccumulated}</span>
                    </div>
                </div>

                {/* Sales 24h Card (White) */}
                <div className="bg-white p-5 rounded-[24px] shadow-sm relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-medium text-slate-500">{t.dashboardMockup.sales24h}</div>
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-slate-400" />
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">{t.dashboardMockup.sales24hValue}</span>
                            <span className="text-sm font-medium text-slate-500">USDT</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1 border border-slate-100 rounded-full px-2 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[10px] text-slate-400">{t.dashboardMockup.onTime}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Bar Mockup */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-[20px] shadow-lg border border-slate-100 flex justify-between items-center px-6">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-[10px] font-bold">N</div>
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto"></div>
            </div>
        </div>
    );
}
