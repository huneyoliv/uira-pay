"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { getCountryData } from "@/lib/countries";

const translations: any = {
    PT: {
        title: "Configurações",
        subtitle: "Gerencie suas preferências e dados da conta.",
        profile: "Perfil",
        profileDesc: "Suas informações pessoais.",
        changePhoto: "Alterar Foto",
        fullName: "Nome Completo",
        email: "Email",
        saveChanges: "Salvar Alterações",
        security: "Segurança",
        securityDesc: "Gerencie sua senha e autenticação.",
        password: "Senha",
        lastChanged: "Última alteração há 3 meses",
        change: "Alterar",
        twoFactor: "Autenticação de Dois Fatores (2FA)",
        twoFactorDesc: "Adicione uma camada extra de segurança.",
        configure: "Configurar",
    },
    EN: {
        title: "Settings",
        subtitle: "Manage your preferences and account data.",
        profile: "Profile",
        profileDesc: "Your personal information.",
        changePhoto: "Change Photo",
        fullName: "Full Name",
        email: "Email",
        saveChanges: "Save Changes",
        security: "Security",
        securityDesc: "Manage your password and authentication.",
        password: "Password",
        lastChanged: "Last changed 3 months ago",
        change: "Change",
        twoFactor: "Two-Factor Authentication (2FA)",
        twoFactorDesc: "Add an extra layer of security.",
        configure: "Configure",
    },
    FR: {
        title: "Paramètres",
        subtitle: "Gérez vos préférences et données de compte.",
        profile: "Profil",
        profileDesc: "Vos informations personnelles.",
        changePhoto: "Changer la photo",
        fullName: "Nom complet",
        email: "Email",
        saveChanges: "Enregistrer les modifications",
        security: "Sécurité",
        securityDesc: "Gérez votre mot de passe et l'authentification.",
        password: "Mot de passe",
        lastChanged: "Dernière modification il y a 3 mois",
        change: "Modifier",
        twoFactor: "Authentification à deux facteurs (2FA)",
        twoFactorDesc: "Ajoutez une couche de sécurité supplémentaire.",
        configure: "Configurer",
    },
    ES: {
        title: "Configuración",
        subtitle: "Administre sus preferencias y datos de la cuenta.",
        profile: "Perfil",
        profileDesc: "Su información personal.",
        changePhoto: "Cambiar Foto",
        fullName: "Nombre Completo",
        email: "Correo Electrónico",
        saveChanges: "Guardar Cambios",
        security: "Seguridad",
        securityDesc: "Administre su contraseña y autenticación.",
        password: "Contraseña",
        lastChanged: "Último cambio hace 3 meses",
        change: "Cambiar",
        twoFactor: "Autenticación de Dos Factores (2FA)",
        twoFactorDesc: "Añada una capa extra de seguridad.",
        configure: "Configurar",
    }
};

export default function SettingsPage() {
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

            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px]">
                <CardHeader>
                    <CardTitle>{t.profile}</CardTitle>
                    <CardDescription>{t.profileDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 border-4 border-slate-50">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "TM"}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" className="rounded-full">{t.changePhoto}</Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t.fullName}</Label>
                            <Input id="name" defaultValue={user?.name || "Totok Michael"} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t.email}</Label>
                            <Input id="email" defaultValue={user?.email || "tmichael20@mail.com"} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-400" disabled />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button className="rounded-full bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white px-8">
                            {t.saveChanges}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px]">
                <CardHeader>
                    <CardTitle>{t.security}</CardTitle>
                    <CardDescription>{t.securityDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">{t.password}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t.lastChanged}</p>
                        </div>
                        <Button variant="outline" className="rounded-full">{t.change}</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">{t.twoFactor}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t.twoFactorDesc}</p>
                        </div>
                        <Button variant="outline" className="rounded-full">{t.configure}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
