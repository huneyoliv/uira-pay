"use client";

import { Globe, ShieldCheck, Search, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export function Features() {
    const { t } = useLanguage();

    const features = [
        {
            title: t.landing.featuresSection.f1_title,
            description: t.landing.featuresSection.f1_desc,
            icon: Globe,
            colSpan: "col-span-1 md:col-span-2",
        },
        {
            title: t.landing.featuresSection.f2_title,
            description: t.landing.featuresSection.f2_desc,
            icon: ShieldCheck,
            colSpan: "col-span-1",
        },
        {
            title: t.landing.featuresSection.f3_title,
            description: t.landing.featuresSection.f3_desc,
            icon: Search,
            colSpan: "col-span-1",
        },
        {
            title: "Performance instantânea",
            description: "Nossa infraestrutura roda na borda, garantindo velocidade incrível em transações globalmente.",
            icon: Zap,
            colSpan: "col-span-1 md:col-span-2",
        }
    ];

    return (
        <section className="py-24 lg:py-32 bg-[#0C0C0C] text-white border-b border-white/5" id="features">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="mb-16">
                    <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-2">Por que o Uirá Pay</p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t.landing.featuresSection.title}</h2>
                    <p className="text-[#6B6B6B] max-w-2xl mt-4 text-lg">
                        {t.landing.featuresSection.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`bg-[#141414] border border-white/10 rounded-3xl p-8 lg:p-10 relative overflow-hidden group hover:border-white/20 transition-colors ${feature.colSpan}`}
                        >
                            <div className="absolute -bottom-10 -right-4 text-[160px] font-black text-white/5 leading-none pointer-events-none select-none transition-transform group-hover:scale-110 group-hover:-translate-y-4 duration-500">
                                0{i + 1}
                            </div>
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8">
                                <feature.icon className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-[#6B6B6B] leading-relaxed text-base max-w-md">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
