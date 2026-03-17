"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, FileText, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { getCountryData } from "@/lib/countries";

const translations: any = {
    PT: {
        title: "Ajuda & Suporte",
        subtitle: "Como podemos ajudar você hoje?",
        docs: "Documentação",
        docsDesc: "Guias detalhados sobre como usar a plataforma.",
        accessDocs: "Acessar Docs",
        email: "Email",
        emailDesc: "Envie um email para suporte@uira.com",
        sendEmail: "Enviar Email",
    },
    EN: {
        title: "Help & Support",
        subtitle: "How can we help you today?",
        docs: "Documentation",
        docsDesc: "Detailed guides on how to use the platform.",
        accessDocs: "Access Docs",
        email: "Email",
        emailDesc: "Send an email to support@uira.com",
        sendEmail: "Send Email",
    },
    FR: {
        title: "Aide & Support",
        subtitle: "Comment pouvons-nous vous aider aujourd'hui ?",
        docs: "Documentation",
        docsDesc: "Guides détaillés sur l'utilisation de la plateforme.",
        accessDocs: "Accéder à la doc",
        email: "Email",
        emailDesc: "Envoyez un email à support@uira.com",
        sendEmail: "Envoyer un email",
    },
    ES: {
        title: "Ayuda y Soporte",
        subtitle: "¿Cómo podemos ayudarle hoy?",
        docs: "Documentación",
        docsDesc: "Guías detalladas sobre cómo usar la plataforma.",
        accessDocs: "Acceder a Docs",
        email: "Correo Electrónico",
        emailDesc: "Envíe un correo a support@uira.com",
        sendEmail: "Enviar Correo",
    }
};

export function HelpPage() {
    const user = useAuthStore((state) => state.user);

    // Determine language
    const countryData = user?.country ? getCountryData(user.country) : { lang: 'PT', locale: 'pt-BR' };
    const lang = user?.language || countryData.lang || 'PT';
    const t = translations[lang] || translations['EN'];

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px] hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <FileText className="h-6 w-6" />
                        </div>
                        <CardTitle>{t.docs}</CardTitle>
                        <CardDescription>{t.docsDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" className="p-0 text-blue-600 font-semibold">
                            {t.accessDocs} <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px] hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                            <Mail className="h-6 w-6" />
                        </div>
                        <CardTitle>{t.email}</CardTitle>
                        <CardDescription>{t.emailDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" className="p-0 text-purple-600 font-semibold">
                            {t.sendEmail} <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
