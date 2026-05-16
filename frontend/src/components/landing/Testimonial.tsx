"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export function Testimonial() {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            name: "Ana Beatriz",
            role: "Freelancer Internacional",
            quote: "Receber pagamentos dos meus clientes na Europa e nos EUA nunca foi tão rápido. As taxas são justas e o dinheiro cai quase na hora.",
            image: "https://i.pravatar.cc/800?img=47"
        },
        {
            name: "Sarah Chen",
            role: "CFO, TechExport",
            quote: "Usamos a Uirá Pay para toda a nossa folha de pagamento internacional. Reduziu nosso custo operacional em 40% em comparação com bancos tradicionais.",
            image: "https://i.pravatar.cc/800?img=44"
        }
    ];

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className="py-24 lg:py-32 bg-[#0C0C0C] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNMCAwdjhINHYtOEgweiIgZmlsbD0iIzAwMDAwMCIvPjwvc3ZnPg==')] mix-blend-overlay"></div>
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#141414] order-2 lg:order-1">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentIndex}
                                src={testimonials[currentIndex].image}
                                alt={testimonials[currentIndex].name}
                                className="object-cover w-full h-full"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-10 order-1 lg:order-2">
                        <div className="relative">
                            <div className="text-[140px] font-serif leading-none absolute -top-16 -left-8 text-emerald-500/20 select-none">"</div>
                            <div className="flex gap-1 text-amber-400 mb-8 relative z-10">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                            
                            <AnimatePresence mode="wait">
                                <motion.p 
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-2xl md:text-3xl text-white leading-relaxed font-medium relative z-10 min-h-[160px]"
                                >
                                    {testimonials[currentIndex].quote}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <div className="flex items-end justify-between border-t border-white/10 pt-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-xl font-bold text-white mb-1">{testimonials[currentIndex].name}</h3>
                                    <p className="text-emerald-400">{testimonials[currentIndex].role}</p>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex gap-3">
                                <button 
                                    onClick={prevTestimonial}
                                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={nextTestimonial}
                                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
