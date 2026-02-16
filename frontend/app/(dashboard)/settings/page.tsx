"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { getCountryData } from "@/lib/countries";
import { api } from "@/lib/api";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { QRCodeSVG } from "qrcode.react";
import {
    Shield, ShieldCheck, ShieldX, Camera, Loader2, Copy, Check, Eye, EyeOff,
    Globe, Palette, AlertTriangle, Key
} from "lucide-react";

const translations: any = {
    PT: {
        title: "Configurações",
        profileTitle: "Perfil",
        profileDesc: "Gerencie suas informações pessoais",
        name: "Nome",
        email: "E-mail",
        document: "Documento",
        country: "País",
        currency: "Moeda",
        changePhoto: "Alterar foto",
        photoRequirements: "PNG, JPG ou JPEG. Máx 2MB.",
        uploadingPhoto: "Enviando...",
        preferencesTitle: "Preferências",
        preferencesDesc: "Idioma e tema da interface",
        language: "Idioma",
        theme: "Tema",
        securityTitle: "Segurança",
        securityDesc: "Autenticação de dois fatores (2FA)",
        twoFAEnabled: "2FA Ativo",
        twoFADisabled: "2FA Desativado",
        setup2FA: "Configurar 2FA",
        disable2FA: "Desativar 2FA",
        reset2FA: "Resetar 2FA",
        scanQR: "Escaneie o QR Code com seu app de autenticação (Google Authenticator, Authy)",
        manualEntry: "Ou insira manualmente:",
        enterCode: "Digite o código de 6 dígitos",
        verify: "Verificar",
        backupCodes: "Códigos de Recuperação",
        backupCodesDesc: "Guarde estes códigos em um lugar seguro. Cada código pode ser usado apenas uma vez para recuperar o acesso.",
        copyAll: "Copiar Todos",
        done: "Concluído",
        disableConfirm: "Para desativar o 2FA, insira sua senha e o código atual do app",
        password: "Senha",
        resetConfirm: "Insira um código de recuperação para resetar o 2FA",
        backupCode: "Código de Recuperação",
        confirm: "Confirmar",
        cancel: "Cancelar",
        success: "Sucesso!",
        error: "Erro",
    },
    EN: {
        title: "Settings",
        profileTitle: "Profile",
        profileDesc: "Manage your personal information",
        name: "Name",
        email: "Email",
        document: "Document",
        country: "Country",
        currency: "Currency",
        changePhoto: "Change photo",
        photoRequirements: "PNG, JPG or JPEG. Max 2MB.",
        uploadingPhoto: "Uploading...",
        preferencesTitle: "Preferences",
        preferencesDesc: "Interface language and theme",
        language: "Language",
        theme: "Theme",
        securityTitle: "Security",
        securityDesc: "Two-factor authentication (2FA)",
        twoFAEnabled: "2FA Active",
        twoFADisabled: "2FA Disabled",
        setup2FA: "Setup 2FA",
        disable2FA: "Disable 2FA",
        reset2FA: "Reset 2FA",
        scanQR: "Scan the QR Code with your authenticator app (Google Authenticator, Authy)",
        manualEntry: "Or enter manually:",
        enterCode: "Enter the 6-digit code",
        verify: "Verify",
        backupCodes: "Recovery Codes",
        backupCodesDesc: "Save these codes in a safe place. Each code can only be used once to recover access.",
        copyAll: "Copy All",
        done: "Done",
        disableConfirm: "To disable 2FA, enter your password and current app code",
        password: "Password",
        resetConfirm: "Enter a recovery code to reset 2FA",
        backupCode: "Recovery Code",
        confirm: "Confirm",
        cancel: "Cancel",
        success: "Success!",
        error: "Error",
    },
    FR: {
        title: "Paramètres",
        profileTitle: "Profil",
        profileDesc: "Gérez vos informations personnelles",
        name: "Nom",
        email: "E-mail",
        document: "Document",
        country: "Pays",
        currency: "Devise",
        changePhoto: "Changer la photo",
        photoRequirements: "PNG, JPG ou JPEG. Max 2 Mo.",
        uploadingPhoto: "Envoi...",
        preferencesTitle: "Préférences",
        preferencesDesc: "Langue et thème de l'interface",
        language: "Langue",
        theme: "Thème",
        securityTitle: "Sécurité",
        securityDesc: "Authentification à deux facteurs (2FA)",
        twoFAEnabled: "2FA Actif",
        twoFADisabled: "2FA Désactivé",
        setup2FA: "Configurer 2FA",
        disable2FA: "Désactiver 2FA",
        reset2FA: "Réinitialiser 2FA",
        scanQR: "Scannez le QR Code avec votre app d'authentification",
        manualEntry: "Ou saisissez manuellement :",
        enterCode: "Entrez le code à 6 chiffres",
        verify: "Vérifier",
        backupCodes: "Codes de Récupération",
        backupCodesDesc: "Conservez ces codes en lieu sûr.",
        copyAll: "Tout Copier",
        done: "Terminé",
        disableConfirm: "Pour désactiver le 2FA, entrez votre mot de passe et le code actuel",
        password: "Mot de passe",
        resetConfirm: "Entrez un code de récupération pour réinitialiser le 2FA",
        backupCode: "Code de Récupération",
        confirm: "Confirmer",
        cancel: "Annuler",
        success: "Succès !",
        error: "Erreur",
    },
    ES: {
        title: "Configuración",
        profileTitle: "Perfil",
        profileDesc: "Gestiona tu información personal",
        name: "Nombre",
        email: "Correo",
        document: "Documento",
        country: "País",
        currency: "Moneda",
        changePhoto: "Cambiar foto",
        photoRequirements: "PNG, JPG o JPEG. Máx 2MB.",
        uploadingPhoto: "Subiendo...",
        preferencesTitle: "Preferencias",
        preferencesDesc: "Idioma y tema de la interfaz",
        language: "Idioma",
        theme: "Tema",
        securityTitle: "Seguridad",
        securityDesc: "Autenticación de dos factores (2FA)",
        twoFAEnabled: "2FA Activo",
        twoFADisabled: "2FA Desactivado",
        setup2FA: "Configurar 2FA",
        disable2FA: "Desactivar 2FA",
        reset2FA: "Resetear 2FA",
        scanQR: "Escanea el código QR con tu app de autenticación",
        manualEntry: "O ingresa manualmente:",
        enterCode: "Ingresa el código de 6 dígitos",
        verify: "Verificar",
        backupCodes: "Códigos de Recuperación",
        backupCodesDesc: "Guarda estos códigos en un lugar seguro.",
        copyAll: "Copiar Todos",
        done: "Listo",
        disableConfirm: "Para desactivar el 2FA, ingresa tu contraseña y el código actual",
        password: "Contraseña",
        resetConfirm: "Ingresa un código de recuperación para resetear el 2FA",
        backupCode: "Código de Recuperación",
        confirm: "Confirmar",
        cancel: "Cancelar",
        success: "¡Éxito!",
        error: "Error",
    },
};

type TwoFAStep = "idle" | "setup" | "verify" | "backup" | "disable" | "reset";

export default function SettingsPage() {
    const user = useAuthStore((state) => state.user);
    const login = useAuthStore((state) => state.login);
    const lang = user?.language || "PT";
    const t = translations[lang] || translations["PT"];

    // Profile photo
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // 2FA state
    const [twoFAStep, setTwoFAStep] = useState<TwoFAStep>("idle");
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [twoFAError, setTwoFAError] = useState("");
    const [twoFASuccess, setTwoFASuccess] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [totpSecret, setTotpSecret] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verifyCode, setVerifyCode] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [disableCode, setDisableCode] = useState("");
    const [resetBackupCode, setResetBackupCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);

    useEffect(() => {
        setIs2FAEnabled(user?.twoFactorEnabled || false);
    }, [user?.twoFactorEnabled]);

    const countryData = user?.country ? getCountryData(user.country) : null;

    // ─── Profile Photo Upload ───────────────────────────────────────────
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            alert(t.photoRequirements);
            return;
        }

        // Show instant preview
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.patch("/me/profile-photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Update store
            if (user) {
                login(null, { ...user, profilePhotoUrl: res.data.profilePhotoUrl });
            }
        } catch (err: any) {
            console.error("Photo upload failed:", err);
            setPhotoPreview(null);
        } finally {
            setUploading(false);
        }
    };

    // ─── 2FA Setup ──────────────────────────────────────────────────────
    const handleSetup2FA = async () => {
        setTwoFALoading(true);
        setTwoFAError("");
        try {
            const res = await api.post("/auth/2fa/setup");
            setQrCodeUrl(res.data.otpAuthUrl);
            setTotpSecret(res.data.secret);
            setBackupCodes(res.data.backupCodes);
            setTwoFAStep("setup");
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || "Failed to setup 2FA");
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (verifyCode.length !== 6) return;
        setTwoFALoading(true);
        setTwoFAError("");
        try {
            await api.post("/auth/2fa/verify", { code: verifyCode });
            setIs2FAEnabled(true);
            setTwoFAStep("backup");
            setTwoFASuccess("2FA enabled!");
            if (user) login(null, { ...user, twoFactorEnabled: true });
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || "Invalid code");
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setTwoFALoading(true);
        setTwoFAError("");
        try {
            await api.post("/auth/2fa/disable", {
                password: disablePassword,
                code: disableCode,
            });
            setIs2FAEnabled(false);
            setTwoFAStep("idle");
            setDisablePassword("");
            setDisableCode("");
            if (user) login(null, { ...user, twoFactorEnabled: false });
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || "Failed to disable 2FA");
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleReset2FA = async () => {
        setTwoFALoading(true);
        setTwoFAError("");
        try {
            await api.post("/auth/2fa/reset", { backupCode: resetBackupCode });
            setIs2FAEnabled(false);
            setTwoFAStep("idle");
            setResetBackupCode("");
            if (user) login(null, { ...user, twoFactorEnabled: false });
            setTwoFASuccess("2FA reset. Please set it up again.");
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || "Invalid backup code");
        } finally {
            setTwoFALoading(false);
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>

            {/* Profile Card */}
            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>{t.profileTitle}</CardTitle>
                    <CardDescription>{t.profileDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-700">
                                <AvatarImage src={photoPreview || user?.profilePhotoUrl || undefined} />
                                <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-xl text-slate-900 dark:text-white">
                                    {user?.name?.substring(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                {uploading ? (
                                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5 text-white" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-sm font-medium text-black dark:text-white hover:underline"
                            >
                                {uploading ? t.uploadingPhoto : t.changePhoto}
                            </button>
                            <p className="text-xs text-slate-400 mt-1">{t.photoRequirements}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-500">{t.name}</Label>
                            <Input value={user?.name || ""} disabled className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-500">{t.email}</Label>
                            <Input value={user?.email || ""} disabled className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-500">{t.document}</Label>
                            <Input value={user?.doc_number || ""} disabled className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-500">{t.country}</Label>
                            <Input value={countryData ? `${countryData.flag} ${countryData.name}` : ""} disabled className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-slate-500" />
                        <div>
                            <CardTitle>{t.preferencesTitle}</CardTitle>
                            <CardDescription>{t.preferencesDesc}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 flex flex-col items-center">
                            <Label className="text-slate-500 text-center w-full">{t.language}</Label>
                            <LanguageSelector className="w-full max-w-[220px]" />
                        </div>
                        <div className="space-y-2 flex flex-col items-center">
                            <Label className="text-slate-500 text-center w-full">{t.theme}</Label>
                            <ThemeToggle className="w-full max-w-[220px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security (2FA) Card */}
            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-slate-500" />
                            <div>
                                <CardTitle>{t.securityTitle}</CardTitle>
                                <CardDescription>{t.securityDesc}</CardDescription>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${is2FAEnabled
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                            {is2FAEnabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldX className="h-3.5 w-3.5" />}
                            {is2FAEnabled ? t.twoFAEnabled : t.twoFADisabled}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {twoFAError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" /> {twoFAError}
                        </div>
                    )}
                    {twoFASuccess && (
                        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0" /> {twoFASuccess}
                        </div>
                    )}

                    {/* Idle State */}
                    {twoFAStep === "idle" && !is2FAEnabled && (
                        <Button onClick={handleSetup2FA} disabled={twoFALoading} className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                            {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                            {t.setup2FA}
                        </Button>
                    )}

                    {twoFAStep === "idle" && is2FAEnabled && (
                        <div className="flex gap-3 flex-wrap">
                            <Button variant="outline" onClick={() => { setTwoFAStep("disable"); setTwoFAError(""); setTwoFASuccess(""); }} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                                <ShieldX className="h-4 w-4 mr-2" />
                                {t.disable2FA}
                            </Button>
                            <Button variant="outline" onClick={() => { setTwoFAStep("reset"); setTwoFAError(""); setTwoFASuccess(""); }} className="dark:border-slate-700 dark:hover:bg-slate-800">
                                {t.reset2FA}
                            </Button>
                        </div>
                    )}

                    {/* Setup Step — QR Code */}
                    {twoFAStep === "setup" && (
                        <div className="space-y-6">
                            <p className="text-sm text-slate-500">{t.scanQR}</p>
                            <div className="flex justify-center p-6 bg-white rounded-xl border border-slate-100 dark:border-slate-700">
                                <QRCodeSVG value={qrCodeUrl} size={200} level="M" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-slate-400 font-medium">{t.manualEntry}</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono break-all">
                                        {showSecret ? totpSecret : "••••••••••••••••"}
                                    </code>
                                    <Button variant="ghost" size="icon" onClick={() => setShowSecret(!showSecret)}>
                                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(totpSecret); }}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{t.enterCode}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="font-mono text-center text-lg tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    <Button onClick={handleVerify2FA} disabled={verifyCode.length !== 6 || twoFALoading} className="bg-black text-white dark:bg-white dark:text-black">
                                        {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.verify}
                                    </Button>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => { setTwoFAStep("idle"); setVerifyCode(""); setTwoFAError(""); }}>
                                {t.cancel}
                            </Button>
                        </div>
                    )}

                    {/* Backup Codes Step */}
                    {twoFAStep === "backup" && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-amber-700 dark:text-amber-300 text-sm">{t.backupCodes}</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t.backupCodesDesc}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, i) => (
                                    <code key={i} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono text-center">
                                        {code}
                                    </code>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={copyBackupCodes} className="dark:border-slate-700">
                                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {t.copyAll}
                                </Button>
                                <Button onClick={() => { setTwoFAStep("idle"); setTwoFASuccess(""); setVerifyCode(""); }} className="bg-black text-white dark:bg-white dark:text-black">
                                    {t.done}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Disable Step */}
                    {twoFAStep === "disable" && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">{t.disableConfirm}</p>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label>{t.password}</Label>
                                    <Input
                                        type="password"
                                        value={disablePassword}
                                        onChange={(e) => setDisablePassword(e.target.value)}
                                        className="dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>{t.enterCode}</Label>
                                    <Input
                                        value={disableCode}
                                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="font-mono text-center tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => { setTwoFAStep("idle"); setTwoFAError(""); }} className="dark:border-slate-700">
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleDisable2FA} disabled={!disablePassword || disableCode.length !== 6 || twoFALoading} variant="destructive">
                                    {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {t.confirm}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Reset Step */}
                    {twoFAStep === "reset" && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">{t.resetConfirm}</p>
                            <div className="space-y-1.5">
                                <Label>{t.backupCode}</Label>
                                <Input
                                    value={resetBackupCode}
                                    onChange={(e) => setResetBackupCode(e.target.value.toUpperCase())}
                                    placeholder="A1B2C3D4"
                                    className="font-mono text-center tracking-[0.3em] dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => { setTwoFAStep("idle"); setTwoFAError(""); }} className="dark:border-slate-700">
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleReset2FA} disabled={!resetBackupCode || twoFALoading} className="bg-black text-white dark:bg-white dark:text-black">
                                    {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {t.confirm}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
