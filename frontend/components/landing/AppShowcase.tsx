"use client";

import { ArrowRight, Globe, Lock, Clock, CreditCard } from "lucide-react";
import Link from "next/link";
import { MobileDashboardMockup } from "@/components/dashboard/MobileDashboardMockup";
import { useLanguage } from "@/app/context/LanguageContext";

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
    ]

    return (
        <section className="py-20 bg-gray-50 text-black">
            <div className="container mx-auto px-6 max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-16">{t.landing.appShowcase.title}</h2>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Phone Showcase */}
                    <div className="relative flex justify-center">
                        <div className="absolute top-4 right-4 w-full h-full bg-gray-200 rounded-3xl -z-10"></div>
                        {/* Phone Mockup Placeholder */}
                        <div className="relative w-[300px] h-[600px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden z-10">
                            <MobileDashboardMockup />
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-8">
                        {features.map((feature, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center border border-gray-100">
                                    <feature.icon className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-1">
                                        {feature.description}
                                    </p>
                                    <Link href="#" className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                        {t.landing.appShowcase.readMore} <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
