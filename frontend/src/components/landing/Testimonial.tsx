"use client";

import { Quote } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export function Testimonial() {
    const { t } = useLanguage();

    return (
        <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl bg-gray-300">
                        {/* Placeholder for Lamin Njie */}
                        <img
                            src="/avatar-placeholder.png"
                            alt={t.landing.testimonial.name}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div>
                            <h3 className="text-2xl font-bold">{t.landing.testimonial.name}</h3>
                            <p className="text-gray-500">{t.landing.testimonial.role}</p>
                        </div>

                        <div className="flex gap-4 items-start">
                            <Quote className="w-8 h-8 text-black flex-shrink-0 fill-current" />
                            <p className="text-gray-600 leading-relaxed">
                                {t.landing.testimonial.quote}
                            </p>
                        </div>

                        {/* Pagination/Navigation dots placeholder */}
                        <div className="flex gap-2 mt-4">
                            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                &larr;
                            </button>
                            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
