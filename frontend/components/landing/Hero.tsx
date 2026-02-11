"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileDashboardMockup } from "@/components/dashboard/MobileDashboardMockup";
import { useLanguage } from "@/app/context/LanguageContext";

export function Hero() {
    const { t } = useLanguage();

    return (
        <section className="relative w-full overflow-hidden bg-[#111111] text-white pt-32 pb-20 lg:pt-48 lg:pb-32">
            {/* Background Gradients/Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-3xl"></div>
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-3xl"></div>
            </div>

            <div className="container relative mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-6 max-w-2xl">
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                            {t.landing.hero.title1} <br />
                            <span className="text-gray-400">{t.landing.hero.title2}</span>
                        </h1>
                        <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                            {t.landing.hero.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-4">
                            <Button asChild className="h-12 px-8 rounded-md bg-white text-black hover:bg-gray-200 text-base font-semibold">
                                <Link href="/send-money">{t.landing.hero.sendMoney}</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-12 px-8 rounded-md border-gray-700 text-white hover:bg-gray-800 hover:text-white text-base">
                                <Link href="/register">{t.landing.hero.openAccount}</Link>
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 mt-8">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111111] bg-gray-600 overflow-hidden relative">
                                        <Image
                                            src="/avatar-placeholder.png"
                                            alt={`User ${i}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-gray-400">
                                {t.landing.hero.trustedBy}
                            </div>
                        </div>

                    </div>

                    <div className="relative lg:h-[600px] flex items-center justify-center">
                        {/* Abstract circle lines behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-white/5 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-white/10 rounded-full"></div>

                        {/* Phone Mockup Placeholder */}
                        <div className="relative w-[300px] md:w-[350px] h-[600px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden z-10">
                            {/* Screen Content */}
                            <MobileDashboardMockup />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
