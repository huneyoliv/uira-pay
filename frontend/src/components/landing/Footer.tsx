"use client";

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-[#1a1a1a] text-white pt-0 pb-10">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex justify-between items-center mb-16 border-b border-gray-800 pb-0 flex-wrap gap-4">
                    <Link to="/" className="block">
                        <img src="/logo-stacked.svg" alt="Uirá Pay" className="h-32 md:h-40 w-auto filter brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                    </Link>

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
                        <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6">
                            Simplificando pagamentos globais para empresas e freelancers. Conectando você ao mundo financeiro sem fronteiras.
                        </p>
                        <div className="flex gap-4">
                            <Link to="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-colors">
                                <span className="sr-only">Twitter</span>
                                {/* Twitter icon */}
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                            </Link>
                            <Link to="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-colors">
                                <span className="sr-only">LinkedIn</span>
                                {/* LinkedIn icon */}
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white">{t.landing.footer.services}</h4>
                        <ul className="space-y-4">
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">{t.landing.nav.features}</Link></li>
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">Cartões</Link></li>
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">Tarifas</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white">{t.landing.footer.about}</h4>
                        <ul className="space-y-4">
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">{t.landing.nav.about}</Link></li>
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">Carreiras</Link></li>
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">Imprensa</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white">{t.landing.footer.help}</h4>
                        <ul className="space-y-4">
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">Privacidade</Link></li>
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">Termos</Link></li>
                            <li><Link to="#" className="text-[#6B6B6B] hover:text-white transition-colors">Segurança</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#6B6B6B]">
                    <p>© {new Date().getFullYear()} Uirá Pay. Todos os direitos reservados.</p>
                    <p>Feito com ❤️ para o mundo.</p>
                </div>
            </div>
        </footer>
    );
}
