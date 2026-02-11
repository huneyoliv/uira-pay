"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/context/LanguageContext";

export function Navbar() {
    const { t } = useLanguage();

    return (
        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full text-white">
            <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    {t.landing.nav.brand}
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                <Link href="#about" className="hover:text-white transition-colors">
                    {t.landing.nav.about}
                </Link>
                <Link href="#features" className="hover:text-white transition-colors">
                    {t.landing.nav.features}
                </Link>
                <Link href="#shop" className="hover:text-white transition-colors">
                    {t.landing.nav.shop}
                </Link>
                <Link href="#contact" className="hover:text-white transition-colors">
                    {t.landing.nav.contact}
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium hover:text-white transition-colors text-gray-300">
                    {t.landing.nav.login}
                </Link>
                <Button asChild className="rounded-full bg-white text-black hover:bg-gray-100 font-medium px-6">
                    <Link href="/register">{t.landing.nav.signup}</Link>
                </Button>
            </div>
        </nav>
    );
}
