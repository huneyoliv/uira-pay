"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const languages = [
    { code: "PT", label: "Português", flag: "🇧🇷" },
    { code: "EN", label: "English", flag: "🇺🇸" },
    { code: "FR", label: "Français", flag: "🇫🇷" },
    { code: "ES", label: "Español", flag: "🇪🇸" },
];

interface LanguageSelectorProps {
    className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
    const { user, login } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const currentLang = languages.find(l => l.code === (user?.language || "PT")) || languages[0];

    const handleLanguageChange = async (langCode: string) => {
        if (!user) return;
        setLoading(true);
        try {
            await api.patch("/me/config", { language: langCode });
            // Update local user state
            login(localStorage.getItem('auth-token') || '', { ...user, language: langCode });
            // Force reload to apply changes globally if needed, or rely on reactive state
            window.location.reload();
        } catch (error) {
            console.error("Failed to update language", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`justify-start gap-2 px-2 ${className || "w-full"}`}>
                    <Globe className="h-4 w-4" />
                    <span>{currentLang.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 dark:border-slate-700">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="gap-2 cursor-pointer dark:hover:bg-slate-800"
                        disabled={loading}
                    >
                        <span className="text-base">{lang.flag}</span>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
