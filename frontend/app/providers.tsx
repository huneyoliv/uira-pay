import { ThemeProvider } from "@/app/context/ThemeContext";
import { LanguageProvider } from "@/app/context/LanguageContext";

export function Providers({ children, lang }: { children: React.ReactNode; lang?: string }) {
    return (
        <LanguageProvider initialLang={lang}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </LanguageProvider>
    );
}
