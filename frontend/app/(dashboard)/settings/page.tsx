"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Camera, Loader2, Shield, Lock, Mail, Smartphone, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChangeEmailModal } from "./components/change-email-modal";
import { ChangePasswordModal } from "./components/change-password-modal";
import { TwoFactorModal } from "./components/two-factor-modal";
import { RecoveryCodesModal } from "./components/recovery-codes-modal";

const cardClass = "bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px]";
const itemClass = "flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";

export default function SettingsPage() {
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modals state
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [is2FAModalOpen, set2FAModalOpen] = useState(false);
    const [isRecoveryModalOpen, setRecoveryModalOpen] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Por favor, envie uma imagem válida (JPEG, PNG).");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("O arquivo deve ter no máximo 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.patch('/me/profile-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            updateUser({ profilePhotoUrl: res.data.profilePhotoUrl });
            toast.success("Foto de perfil atualizada!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar foto.");
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie suas informações pessoais e segurança da conta.</p>
            </div>

            {/* Profile Section */}
            <Card className={cardClass}>
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Perfil</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Suas informações públicas e foto de perfil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 border-2 border-slate-200 dark:border-slate-700 cursor-pointer" onClick={triggerFileInput}>
                                <AvatarImage src={user?.profilePhotoUrl || ""} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                                    {user?.name?.substring(0, 2).toUpperCase() || "ME"}
                                </AvatarFallback>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="text-white h-8 w-8" />
                                </div>
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleFileChange}
                            />
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/60 rounded-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-white" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg text-slate-900 dark:text-white">{user?.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            <Button variant="outline" size="sm" onClick={triggerFileInput} disabled={uploading}
                                className="rounded-full border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                {uploading ? "Enviando..." : "Alterar Foto"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-slate-500 dark:text-slate-400">Nome da Empresa</Label>
                            <Input value={user?.name || ""} disabled className="bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-500 dark:text-slate-400">Documento</Label>
                            <Input value={user?.doc_number || ""} disabled className="bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card className={cardClass}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Globe className="h-5 w-5" />
                        Preferências
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Idioma e tema da interface.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-slate-500 dark:text-slate-400">Idioma</Label>
                            <LanguageSelector className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-500 dark:text-slate-400">Tema</Label>
                            <ThemeToggle className="w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card className={cardClass}>
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Segurança</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Proteja sua conta com autenticação de dois fatores e senhas fortes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">

                    {/* Change Password */}
                    <div className={itemClass}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">Senha</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Última alteração: nunca</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setPasswordModalOpen(true)}
                            className="rounded-full border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700">
                            Alterar
                        </Button>
                    </div>

                    {/* Change Email */}
                    <div className={itemClass}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">Endereço de E-mail</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setEmailModalOpen(true)}
                            className="rounded-full border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700">
                            Alterar
                        </Button>
                    </div>

                    {/* 2FA */}
                    <div className={itemClass}>
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${user?.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">Autenticação de Dois Fatores (2FA)</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {user?.twoFactorEnabled ? "Protegido com App Autenticador" : "Adicione uma camada extra de segurança"}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant={user?.twoFactorEnabled ? "outline" : "default"}
                            onClick={() => set2FAModalOpen(true)}
                            className={user?.twoFactorEnabled
                                ? "rounded-full border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                                : "rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg shadow-black/20 dark:shadow-white/10"
                            }
                        >
                            {user?.twoFactorEnabled ? "Gerenciar" : "Ativar"}
                        </Button>
                    </div>

                    {/* Recovery Codes */}
                    {user?.twoFactorEnabled && (
                        <div className={itemClass}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-full">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900 dark:text-white">Códigos de Recuperação</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Use se perder acesso ao seu celular</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setRecoveryModalOpen(true)}
                                className="rounded-full border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700">
                                Visualizar
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>

            <ChangeEmailModal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} />
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
            <TwoFactorModal isOpen={is2FAModalOpen} onClose={() => set2FAModalOpen(false)} />
            <RecoveryCodesModal isOpen={isRecoveryModalOpen} onClose={() => setRecoveryModalOpen(false)} />
        </div>
    );
}
