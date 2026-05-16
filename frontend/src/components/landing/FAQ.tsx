"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export function FAQ() {
    const { t } = useLanguage();

    const faqs = [
        {
            question: t.landing.faq.q1,
            answer: t.landing.faq.a1,
        },
        {
            question: t.landing.faq.q2,
            answer: t.landing.faq.a2,
        },
        {
            question: t.landing.faq.q3,
            answer: t.landing.faq.a3,
        },
        {
            question: t.landing.faq.q4,
            answer: t.landing.faq.a4,
        },
        {
            question: t.landing.faq.q5,
            answer: t.landing.faq.a5,
        },
        {
            question: t.landing.faq.q6,
            answer: t.landing.faq.a6,
        },
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 lg:py-32 bg-[#FAFAFA]" id="faq">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-5">
                        <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-2">Suporte e Ajuda</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#0C0C0C]">
                            {t.landing.faq.title}
                        </h2>
                        <p className="text-[#6B6B6B] text-lg max-w-md">
                            Tem dúvidas sobre como o Uirá Pay funciona? Encontre respostas rápidas para as perguntas mais comuns de nossos usuários.
                        </p>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === i ? 'bg-[#141414] border-[#141414]' : 'bg-white hover:border-gray-300 cursor-pointer'}`}
                            >
                                <div 
                                    className="px-6 py-5 flex gap-4 items-center cursor-pointer"
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                >
                                    <span className={`font-mono font-bold text-sm ${openIndex === i ? 'text-emerald-500' : 'text-gray-400'}`}>
                                        0{i + 1}
                                    </span>
                                    <h3 className={`text-lg font-bold flex-1 transition-colors ${openIndex === i ? 'text-white' : 'text-[#0C0C0C]'}`}>
                                        {faq.question}
                                    </h3>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === i ? 'bg-white/10 text-white' : 'bg-gray-100 text-[#0C0C0C]'}`}>
                                        <Plus className={`w-4 h-4 transition-transform duration-300 ${openIndex === i ? 'rotate-45' : ''}`} />
                                    </div>
                                </div>
                                <AnimatePresence initial={false}>
                                    {openIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-6 pb-6 pt-2 pl-14 text-gray-400 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
