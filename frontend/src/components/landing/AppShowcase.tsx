"use client";

import { ArrowRight, Globe, Lock, Clock, CreditCard } from "lucide-react";
import { Link } from 'react-router-dom';
import { MobileDashboardMockup } from "@/components/dashboard/MobileDashboardMockup";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export function AppShowcase() {
    const { t } = useLanguage();

    const features = [
        {
            title: t.landing.appShowcase.f1_title,
            description: t.landing.appShowcase.f1_desc,
            icon: Globe,
        },
        {
            title: t.landing.appShowcase.f2_title,
            description: t.landing.appShowcase.f2_desc,
            icon: Lock,
        },
        {
            title: t.landing.appShowcase.f3_title,
            description: t.landing.appShowcase.f3_desc,
            icon: Clock,
        },
        {
            title: t.landing.appShowcase.f4_title,
            description: t.landing.appShowcase.f4_desc,
            icon: CreditCard,
        }
    ];

    return (
        <section className="py-24 lg:py-32 bg-[#FAFAFA] text-[#0C0C0C] overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Features List (Left side now) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="space-y-12 order-2 lg:order-1"
                    >
                        <div>
                            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-2">App mobile</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">{t.landing.appShowcase.title}</h2>
                        </div>
                        
                        <div className="space-y-8 border-t border-gray-200 pt-8">
                            {features.map((feature, i) => (
                                <div key={i} className="flex gap-6 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="text-emerald-500 font-mono font-bold pt-1">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                                            <feature.icon className="w-5 h-5 text-emerald-600" />
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-500 text-base leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Link to="/register" className="inline-flex items-center gap-2 bg-[#0C0C0C] text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-500 transition-colors">
                                Baixar o aplicativo <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Phone Showcase (Right side now) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                        className="relative flex justify-center order-1 lg:order-2"
                    >
                        {/* Background decor */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10"></div>
                        
                        {/* Phone Mockup Placeholder */}
                        <div className="relative w-[300px] h-[600px] bg-[#141414] rounded-[3rem] border-[10px] border-[#0C0C0C] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] overflow-hidden z-10 bg-white">
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/40 to-transparent z-20 pointer-events-none"></div>
                            <MobileDashboardMockup />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
