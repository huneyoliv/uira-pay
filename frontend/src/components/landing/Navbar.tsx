"use client";

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const { t } = useLanguage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out py-5 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent border-b border-transparent'}`}>
            <div className="flex items-center justify-between px-6 max-w-7xl mx-auto w-full text-white">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center">
                        <img src="/logo-bird.svg" alt="Uirá Pay" className="h-12 w-auto filter brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link to="#about" className="hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-emerald-500 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 pb-1">
                        {t.landing.nav.about}
                    </Link>
                    <Link to="#features" className="hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-emerald-500 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 pb-1">
                        {t.landing.nav.features}
                    </Link>
                    <Link to="#shop" className="hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-emerald-500 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 pb-1">
                        {t.landing.nav.shop}
                    </Link>
                    <Link to="#contact" className="hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-emerald-500 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 pb-1">
                        {t.landing.nav.contact}
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium hover:text-white transition-colors text-gray-300">
                        {t.landing.nav.login}
                    </Link>
                    <motion.div whileTap={{ scale: 0.97 }}>
                        <Button asChild className="rounded-md bg-emerald-500 text-white hover:bg-emerald-400 font-semibold px-6 border-none shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <Link to="/register">{t.landing.nav.signup}</Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden flex flex-col px-6 py-8 gap-6 shadow-2xl"
                    >
                        <Link to="#about" className="text-lg font-medium text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            {t.landing.nav.about}
                        </Link>
                        <Link to="#features" className="text-lg font-medium text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            {t.landing.nav.features}
                        </Link>
                        <Link to="#shop" className="text-lg font-medium text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            {t.landing.nav.shop}
                        </Link>
                        <Link to="#contact" className="text-lg font-medium text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            {t.landing.nav.contact}
                        </Link>
                        
                        <div className="h-px bg-white/10 w-full my-2"></div>
                        
                        <div className="flex flex-col gap-4">
                            <Link to="/login" className="text-lg font-medium text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                                {t.landing.nav.login}
                            </Link>
                            <Button asChild className="w-full rounded-md bg-emerald-500 text-white hover:bg-emerald-400 font-semibold h-12">
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>{t.landing.nav.signup}</Link>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
