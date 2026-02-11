"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { MobileDashboardMockup } from "@/components/dashboard/MobileDashboardMockup";
import { Globe, Accessibility, Mail, Building2, ShieldCheck, MapPin, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";

interface AuthLayoutProps {
    children: React.ReactNode;
    type: "login" | "register";
    currentStep?: number;
}

export function AuthLayout({ children, type, currentStep }: AuthLayoutProps) {
    const { t, language, setLanguage } = useLanguage();

    // Force light mode on auth pages — no dark mode on login/register
    useEffect(() => {
        const root = document.documentElement;
        const wasDark = root.classList.contains("dark");
        root.classList.remove("dark");
        root.classList.add("light");

        return () => {
            // Restore previous theme when leaving auth pages
            root.classList.remove("light");
            if (wasDark) {
                root.classList.add("dark");
            }
        };
    }, []);

    // Map language code to country code for flag
    const currentCountry = countries.find(c => c.lang === language) || countries[0];

    // Helper to render the dynamic visual
    const renderVisual = () => {
        // Login always shows the dashboard mockup
        if (type === 'login' || !currentStep) {
            return (
                <div className="relative w-[280px] h-[560px] bg-[#1e293b] rounded-[40px] shadow-2xl border-[8px] border-[#2e3b4e] overflow-hidden ml-[-20px] rotate-[-5deg] hover:rotate-0 transition-all duration-500 ease-in-out hover:scale-105">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#000] rounded-b-xl z-20"></div>
                    <MobileDashboardMockup />
                </div>
            );
        }

        // Registration Steps Visuals
        switch (currentStep) {
            case 2: // Email Verify
                return (
                    <div className="relative flex items-center justify-center w-[400px] h-[400px]">
                        <div className="absolute inset-0 bg-slate-400 opacity-20 blur-[100px] rounded-full"></div>
                        <div className="relative z-10 w-48 h-48 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-500">
                            <Mail className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            {currentStep === 2 && (
                                <div className="absolute -top-6 -right-6 w-20 h-20 bg-black rounded-2xl flex items-center justify-center border-4 border-[#0B0F19] shadow-xl animate-bounce">
                                    <span className="text-2xl font-bold text-white">...</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 3: // Location
                return (
                    <div className="relative flex items-center justify-center w-[400px] h-[400px]">
                        <div className="absolute inset-0 bg-blue-600 opacity-20 blur-[100px] rounded-full"></div>
                        <div className="relative z-10 w-56 h-56 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-all duration-700">
                            <Globe className="w-32 h-32 text-blue-200" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute -bottom-4 right-10 bg-white text-[#0B0F19] px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span>Global</span>
                            </div>
                        </div>
                    </div>
                );
            case 4: // Company Details
                return (
                    <div className="relative flex items-center justify-center w-[400px] h-[400px]">
                        <div className="absolute inset-0 bg-orange-500 opacity-20 blur-[100px] rounded-full"></div>
                        <div className="relative z-10 w-52 h-64 bg-white/10 backdrop-blur-md rounded-t-3xl rounded-b-lg border border-white/20 flex flex-col items-center justify-center shadow-2xl hover:scale-105 transition-all duration-500">
                            <Building2 className="w-28 h-28 text-orange-100 mb-4" />
                            <div className="w-32 h-2 bg-white/20 rounded-full mb-2"></div>
                            <div className="w-24 h-2 bg-white/20 rounded-full"></div>
                            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg border-4 border-[#0B0F19]">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                );
            case 5: // Security
                return (
                    <div className="relative flex items-center justify-center w-[400px] h-[400px]">
                        <div className="absolute inset-0 bg-emerald-500 opacity-20 blur-[100px] rounded-full"></div>
                        <div className="relative z-10 w-48 h-56 bg-gradient-to-br from-slate-700 to-[#0B0F19] rounded-[40px] border border-white/20 flex items-center justify-center shadow-2xl flex-col hover:shadow-emerald-500/20 transition-all duration-500">
                            <ShieldCheck className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                            <div className="mt-4 text-emerald-200 font-mono text-xs tracking-widest">SECURE</div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="relative w-[280px] h-[560px] bg-[#1e293b] rounded-[40px] shadow-2xl border-[8px] border-[#2e3b4e] overflow-hidden ml-[-20px] rotate-[-5deg] hover:rotate-0 transition-all duration-500 ease-in-out hover:scale-105">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#000] rounded-b-xl z-20"></div>
                        <MobileDashboardMockup />
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen w-full font-sans overflow-hidden">
            {/* Left Panel - Branding & Mockup (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0B0F19] text-white relative flex-col justify-between p-12 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-slate-500 blur-[150px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-900 blur-[150px]"></div>
                </div>

                {/* Slogan */}
                <div className="relative z-10 mt-12 mb-8">
                    <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        {(currentStep === 2 && t.auth.sloganStep2 ? t.auth.subSloganStep2 :
                            currentStep === 4 && t.auth.sloganStep4 ? t.auth.subSloganStep4 :
                                t.auth.subSlogan)}
                    </p>
                    <h1 className="text-5xl font-bold leading-tight">
                        {(currentStep === 2 && t.auth.sloganStep2 ? t.auth.sloganStep2 :
                            currentStep === 4 && t.auth.sloganStep4 ? t.auth.sloganStep4 :
                                t.auth.slogan)}
                        <span className="text-white">.</span>
                    </h1>
                </div>

                {/* Dynamic Visual Presentation */}
                <div className="relative z-10 flex-1 flex items-center justify-center translate-y-8">
                    {renderVisual()}
                    {/* Secondary Visual (Static/Decorative) behind - only show for dashboard mockup for now or adjust generic */}
                    {!currentStep && (
                        <div className="absolute w-[260px] h-[520px] bg-[#0f172a] rounded-[36px] border-[6px] border-[#1e293b] top-12 -right-4 -z-10 opacity-60 blur-[1px] rotate-[5deg]"></div>
                    )}
                </div>

                {/* Accessibility Icon (Bottom Left) */}
                <div className="relative z-10 pt-8">

                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-orange-500 transition-colors">
                        <Accessibility className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col p-6 lg:p-12 relative overflow-y-auto">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-8 lg:mb-12">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold dark:bg-white dark:text-black">U</div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href={type === 'login' ? '/register' : '/login'} className="text-sm font-medium text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors">
                            {type === 'login' ? t.login.registerLink : t.login.loginButton}
                        </Link>
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex flex-col justify-center max-w-[480px] w-full mx-auto">
                    {children}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p>{t.auth.copyright}</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="hover:text-slate-600">{t.auth.contact}</Link>
                        <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            <select
                                className="bg-transparent border-none outline-none cursor-pointer hover:text-slate-600"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as any)}
                            >
                                <option value="EN">English</option>
                                <option value="PT">Português</option>
                                <option value="ES">Español</option>
                                <option value="FR">Français</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
