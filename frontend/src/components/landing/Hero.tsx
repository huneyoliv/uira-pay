"use client";

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MobileDashboardMockup } from "@/components/dashboard/MobileDashboardMockup";
import { useLanguage } from "@/context/LanguageContext";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Hero() {
    const { t } = useLanguage();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
    };

    return (
        <section className="relative w-full overflow-hidden bg-[#0C0C0C] text-white pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-[100dvh] flex items-center">
            {/* Background Gradients/Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.03) 50px)" }}>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]"></div>
            </div>

            <div className="container relative mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center flex-col-reverse md:flex-row">
                    <motion.div 
                        className="flex flex-col gap-6 max-w-2xl lg:pr-16 z-10"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]">
                            {t.landing.hero.title1} <br className="hidden md:block" />
                            <span className="text-gray-400">{t.landing.hero.title2}</span>
                        </motion.h1>
                        
                        <motion.p variants={itemVariants} className="text-lg text-[#6B6B6B] leading-relaxed max-w-lg mt-2">
                            {t.landing.hero.description}
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mt-4">
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Button asChild className="h-14 px-8 rounded-md bg-emerald-500 text-white hover:bg-emerald-400 text-base font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] border-none">
                                    <Link to="/register" className="flex items-center gap-2">
                                        {t.landing.hero.openAccount} <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Button asChild variant="outline" className="h-14 px-8 rounded-md border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white text-base relative overflow-hidden group">
                                    <Link to="/send-money">
                                        <span className="relative z-10">{t.landing.hero.sendMoney}</span>
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8 pt-8 border-t border-white/10">
                            <div className="flex -space-x-3">
                                {[47, 12, 33].map((id, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0C0C0C] bg-gray-800 overflow-hidden relative">
                                        <img
                                            src={`https://i.pravatar.cc/100?img=${id}`}
                                            alt={`User ${i}`}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-mono text-gray-400 tabular-nums">
                                +50k usuários · BRL + USD · 0% taxa
                            </div>
                        </motion.div>

                    </motion.div>

                    <div className="relative lg:h-[700px] flex items-center justify-center mt-12 lg:mt-0">
                        {/* Abstract animated ring behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-dashed border-white/10 rounded-full animate-[spin_40s_linear_infinite]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>

                        {/* Phone Mockup Placeholder */}
                        <div className="relative w-[300px] md:w-[350px] h-[600px] bg-[#141414] rounded-[3rem] border-8 border-[#222] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden z-10 animate-float">
                            {/* Reflection */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent z-20 pointer-events-none"></div>
                            {/* Screen Content */}
                            <MobileDashboardMockup />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
