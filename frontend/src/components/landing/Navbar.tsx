"use client";

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
    const { t } = useLanguage();

    return (
        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full text-white">
            <div className="flex items-center gap-2">
                <Link to="/" className="text-2xl font-bold tracking-tighter">
                    {t.landing.nav.brand}
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                <Link to="#about" className="hover:text-white transition-colors">
                    {t.landing.nav.about}
                </Link>
                <Link to="#features" className="hover:text-white transition-colors">
                    {t.landing.nav.features}
                </Link>
                <Link to="#shop" className="hover:text-white transition-colors">
                    {t.landing.nav.shop}
                </Link>
                <Link to="#contact" className="hover:text-white transition-colors">
                    {t.landing.nav.contact}
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium hover:text-white transition-colors text-gray-300">
                    {t.landing.nav.login}
                </Link>
                <Button asChild className="rounded-full bg-white text-black hover:bg-gray-100 font-medium px-6">
                    <Link to="/register">{t.landing.nav.signup}</Link>
                </Button>
            </div>
        </nav>
    );
}
