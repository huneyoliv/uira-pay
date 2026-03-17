"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
        <section className="py-20 bg-white" id="faq">
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-black">
                    {t.landing.faq.title}
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="border-b border-gray-200 py-4 cursor-pointer"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-black pr-8 hover:text-gray-700 transition-colors">
                                    {faq.question}
                                </h3>
                                {openIndex === i ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                )}
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
