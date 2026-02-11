"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getCountryData } from "@/lib/countries";
import { locales } from "@/lib/locales";

type Language = "PT" | "EN" | "ES" | "FR";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (typeof locales)["EN"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children, initialLang = "EN" }: { children: React.ReactNode; initialLang?: string }) => {
    const [language, setLanguage] = useState<Language>(initialLang as Language);

    useEffect(() => {
        // 1. Try to get from localStorage
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang && locales[savedLang]) {
            setLanguage(savedLang);
            return;
        }

        // 2. Try to get from browser settings
        const browserLang = navigator.language || navigator.languages[0];
        if (browserLang) {
            const langCode = browserLang.split("-")[0].toUpperCase();

            // Map common language codes to our supported languages
            if (langCode === "PT") {
                setLanguage("PT");
            } else if (langCode === "ES") {
                setLanguage("ES");
            } else if (langCode === "FR") {
                setLanguage("FR");
            } else {
                // Default to EN for any other language (including EN itself)
                setLanguage("EN");
            }
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    };

    const t = locales[language] || locales["EN"];

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
