"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, FileText, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { getCountryData } from "@/lib/countries";

const translations: any = {
    PT: {
        title: "Ajuda & Suporte",
        subtitle: "Como podemos ajudar você hoje?",
        docs: "Documentação",
        docsDesc: "Guias detalhados sobre como usar a plataforma.",
        accessDocs: "Acessar Docs",
        liveChat: "Chat ao Vivo",
        liveChatDesc: "Fale com nossa equipe de suporte em tempo real.",
        startChat: "Iniciar Chat",
        email: "Email",
        emailDesc: "Envie um email para suporte@uira.com",
        sendEmail: "Enviar Email",
        needHelp: "Ainda precisa de ajuda?",
        needHelpDesc: "Nossa equipe está disponível de segunda a sexta, das 9h às 18h para te ajudar com qualquer dúvida.",
        talkToExpert: "Falar com Especialista",
    },
    EN: {
        title: "Help & Support",
        subtitle: "How can we help you today?",
        docs: "Documentation",
        docsDesc: "Detailed guides on how to use the platform.",
        accessDocs: "Access Docs",
        liveChat: "Live Chat",
        liveChatDesc: "Talk to our support team in real-time.",
        startChat: "Start Chat",
        email: "Email",
        emailDesc: "Send an email to support@uira.com",
        sendEmail: "Send Email",
        needHelp: "Still need help?",
        needHelpDesc: "Our team is available Monday to Friday, 9am to 6pm to help you with any questions.",
        talkToExpert: "Talk to an Expert",
    },
    FR: {
        title: "Aide & Support",
        subtitle: "Comment pouvons-nous vous aider aujourd'hui ?",
        docs: "Documentation",
        docsDesc: "Guides détaillés sur l'utilisation de la plateforme.",
        accessDocs: "Accéder à la doc",
        liveChat: "Chat en direct",
        liveChatDesc: "Parlez à notre équipe de support en temps réel.",
        startChat: "Démarrer le chat",
        email: "Email",
        emailDesc: "Envoyez un email à support@uira.com",
        sendEmail: "Envoyer un email",
        needHelp: "Encore besoin d'aide ?",
        needHelpDesc: "Notre équipe est disponible du lundi au vendredi, de 9h à 18h pour répondre à toutes vos questions.",
        talkToExpert: "Parler à un expert",
    },
    ES: {
        title: "Ayuda y Soporte",
        subtitle: "¿Cómo podemos ayudarle hoy?",
        docs: "Documentación",
        docsDesc: "Guías detalladas sobre cómo usar la plataforma.",
        accessDocs: "Acceder a Docs",
        liveChat: "Chat en Vivo",
        liveChatDesc: "Hable con nuestro equipo de soporte en tiempo real.",
        startChat: "Iniciar Chat",
        email: "Correo Electrónico",
        emailDesc: "Envíe un correo a support@uira.com",
        sendEmail: "Enviar Correo",
        needHelp: "¿Aún necesita ayuda?",
        needHelpDesc: "Nuestro equipo está disponible de lunes a viernes, de 9h a 18h para ayudarle con cualquier duda.",
        talkToExpert: "Hablar con un Experto",
    }
};

export default function HelpPage() {
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
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
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

                <Card className="bg-white border-none shadow-sm rounded-[32px] hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <CardTitle>{t.liveChat}</CardTitle>
                        <CardDescription>{t.liveChatDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" className="p-0 text-green-600 font-semibold">
                            {t.startChat} <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm rounded-[32px] hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
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

            <Card className="bg-black dark:bg-white text-white dark:text-black border-none shadow-xl rounded-[32px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-black/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">{t.needHelp}</h3>
                    <p className="text-slate-300 dark:text-slate-600 mb-6 max-w-lg">{t.needHelpDesc}</p>
                    <Button className="bg-white text-black hover:bg-slate-100 dark:bg-black dark:text-white dark:hover:bg-slate-900 rounded-full px-8 font-bold">
                        {t.talkToExpert}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
