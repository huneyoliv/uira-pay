"use client";

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-[#1a1a1a] text-white pt-20 pb-10">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex justify-between items-center mb-16 border-b border-gray-800 pb-8 flex-wrap gap-4">
                    <div className="text-2xl font-bold tracking-widest barcode-font">
                        <span className="font-mono text-4xl">|||||</span> {t.landing.nav.brand}
                    </div>

                    <div className="flex items-center gap-8">
                        <span className="text-xl">{t.landing.footer.ready}</span>
                        <Link to="/register" className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                            {t.landing.footer.getStarted}
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold mb-6">{t.landing.footer.subscribe}</h3>
                        <div className="flex items-center border-b border-gray-700 pb-2 max-w-md">
                            <input
                                type="email"
                                placeholder={t.landing.footer.emailPlaceholder}
                                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
                            />
                            <button className="bg-white text-black w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-6 mt-8">
                            <Link to="#" className="hover:text-gray-400"><Facebook className="w-5 h-5" /></Link>
                            <Link to="#" className="hover:text-gray-400"><Twitter className="w-5 h-5" /></Link>
                            <Link to="#" className="hover:text-gray-400"><Instagram className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">{t.landing.footer.services}</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.s_emailMarketing}</Link></li>
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.s_campaigns}</Link></li>
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.s_branding}</Link></li>
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.s_offline}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">{t.landing.footer.about}</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.a_story}</Link></li>
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.a_benefits}</Link></li>
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.a_team}</Link></li>
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.a_careers}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">{t.landing.footer.help}</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.h_faqs}</Link></li>
                            <li><Link to="#" className="hover:text-white">{t.landing.footer.h_contact}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 pt-8 border-t border-gray-800">
                    <div>
                        © 2023 {t.landing.nav.brand}. {t.landing.footer.rights}
                    </div>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <Link to="#" className="hover:text-white">{t.landing.footer.terms}</Link>
                        <Link to="#" className="hover:text-white">{t.landing.footer.privacy}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
