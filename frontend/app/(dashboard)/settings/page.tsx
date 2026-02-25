"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Camera, Loader2, Shield, Lock, Mail, Smartphone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ChangeEmailModal } from "./components/change-email-modal";
import { ChangePasswordModal } from "./components/change-password-modal";
import { TwoFactorModal } from "./components/two-factor-modal";
import { RecoveryCodesModal } from "./components/recovery-codes-modal";

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
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança da conta.</p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>Suas informações públicas e foto de perfil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 border-2 border-slate-100 cursor-pointer" onClick={triggerFileInput}>
                                <AvatarImage src={user?.profilePhotoUrl || ""} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold">
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
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg">{user?.name}</h3>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            <Button variant="outline" size="sm" onClick={triggerFileInput} disabled={uploading}>
                                {uploading ? "Enviando..." : "Alterar Foto"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Nome da Empresa</Label>
                            <Input value={user?.name || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Documento</Label>
                            <Input value={user?.doc_number || ""} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Proteja sua conta com autenticação de dois fatores e senhas fortes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Change Password */}
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium">Senha</h4>
                                <p className="text-sm text-muted-foreground">Última alteração: nunca</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setPasswordModalOpen(true)}>Alterar</Button>
                    </div>

                    {/* Change Email */}
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-full dark:bg-green-900 dark:text-green-200">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium">Endereço de E-mail</h4>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setEmailModalOpen(true)}>Alterar</Button>
                    </div>

                    {/* 2FA */}
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${user?.twoFactorEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200'}`}>
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium">Autenticação de Dois Fatores (2FA)</h4>
                                <p className="text-sm text-muted-foreground">
                                    {user?.twoFactorEnabled ? "Protegido com App Autenticador" : "Adicione uma camada extra de segurança"}
                                </p>
                            </div>
                        </div>
                        <Button variant={user?.twoFactorEnabled ? "outline" : "default"} onClick={() => set2FAModalOpen(true)}>
                            {user?.twoFactorEnabled ? "Gerenciar" : "Ativar"}
                        </Button>
                    </div>

                    {/* Recovery Codes */}
                    {user?.twoFactorEnabled && (
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-full dark:bg-purple-900 dark:text-purple-200">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Códigos de Recuperação</h4>
                                    <p className="text-sm text-muted-foreground">Use se perder acesso ao seu celular</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setRecoveryModalOpen(true)}>Visualizar</Button>
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
