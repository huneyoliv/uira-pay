"use client";

import { Globe, ShieldCheck, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Features() {
    const { t } = useLanguage();

    const features = [
        {
            title: t.landing.featuresSection.f1_title,
            description: t.landing.featuresSection.f1_desc,
            icon: Globe,
        },
        {
            title: t.landing.featuresSection.f2_title,
            description: t.landing.featuresSection.f2_desc,
            icon: ShieldCheck,
        },
        {
            title: t.landing.featuresSection.f3_title,
            description: t.landing.featuresSection.f3_desc,
            icon: Search,
        },
    ];

    return (
        <section className="py-20 lg:py-32 bg-white text-black" id="features">
            <div className="container mx-auto px-6 max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.landing.featuresSection.title}</h2>
                <p className="text-gray-600 max-w-2xl mb-16">
                    {t.landing.featuresSection.description}
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
