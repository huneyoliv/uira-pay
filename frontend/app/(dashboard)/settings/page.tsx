"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
    Shield, ShieldCheck, ShieldX, Camera, Loader2, Copy, Check, Eye, EyeOff,
    Globe, Palette, AlertTriangle, Key, X, Crop as CropIcon
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
        emailCode: "Código de E-mail",
        emailCodeDesc: "Enviaremos um código de verificação para seu e-mail",
        sendCode: "Enviar Código",
        codeSent: "Código enviado!",
        changePasswordTitle: "Alterar Senha",
        changePasswordDesc: "Atualize sua senha de acesso",
        currentPassword: "Senha Atual",
        newPassword: "Nova Senha",
        changePassword: "Alterar Senha",
        changingPassword: "Alterando...",
        passwordChanged: "Senha alterada com sucesso!",
        changeEmailTitle: "Alterar E-mail",
        changeEmailDesc: "Atualize seu endereço de e-mail",
        newEmail: "Novo E-mail",
        changeEmailStep1: "Primeiro, enviaremos um código para seu e-mail atual",
        changeEmailStep2: "Digite o código enviado para seu e-mail atual",
        changeEmailStep3: "Digite o novo e-mail e o código de verificação",
        requestChange: "Solicitar Alteração",
        confirmEmail: "Confirmar E-mail",
        changingEmail: "Alterando...",
        emailChanged: "E-mail alterado com sucesso!",
        regenerateCodes: "Regenerar Códigos",
        regenerateCodesDesc: "Gere novos códigos de recuperação (os antigos serão invalidados)",
        regenerating: "Regenerando...",
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
        emailCode: "Email Code",
        emailCodeDesc: "We'll send a verification code to your email",
        sendCode: "Send Code",
        codeSent: "Code sent!",
        changePasswordTitle: "Change Password",
        changePasswordDesc: "Update your access password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        changePassword: "Change Password",
        changingPassword: "Changing...",
        passwordChanged: "Password changed successfully!",
        changeEmailTitle: "Change Email",
        changeEmailDesc: "Update your email address",
        newEmail: "New Email",
        changeEmailStep1: "First, we'll send a code to your current email",
        changeEmailStep2: "Enter the code sent to your current email",
        changeEmailStep3: "Enter your new email and verification code",
        requestChange: "Request Change",
        confirmEmail: "Confirm Email",
        changingEmail: "Changing...",
        emailChanged: "Email changed successfully!",
        regenerateCodes: "Regenerate Codes",
        regenerateCodesDesc: "Generate new recovery codes (old ones will be invalidated)",
        regenerating: "Regenerating...",
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
        emailCode: "Code E-mail",
        emailCodeDesc: "Nous enverrons un code de vérification à votre e-mail",
        sendCode: "Envoyer le Code",
        codeSent: "Code envoyé !",
        changePasswordTitle: "Changer le Mot de Passe",
        changePasswordDesc: "Mettez à jour votre mot de passe",
        currentPassword: "Mot de Passe Actuel",
        newPassword: "Nouveau Mot de Passe",
        changePassword: "Changer le Mot de Passe",
        changingPassword: "Modification...",
        passwordChanged: "Mot de passe modifié avec succès !",
        changeEmailTitle: "Changer l'E-mail",
        changeEmailDesc: "Mettez à jour votre adresse e-mail",
        newEmail: "Nouvel E-mail",
        changeEmailStep1: "D'abord, nous enverrons un code à votre e-mail actuel",
        changeEmailStep2: "Entrez le code envoyé à votre e-mail actuel",
        changeEmailStep3: "Entrez votre nouvel e-mail et le code de vérification",
        requestChange: "Demander la Modification",
        confirmEmail: "Confirmer l'E-mail",
        changingEmail: "Modification...",
        emailChanged: "E-mail modifié avec succès !",
        regenerateCodes: "Régénérer les Codes",
        regenerateCodesDesc: "Générer de nouveaux codes de récupération",
        regenerating: "Régénération...",
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
        emailCode: "Código de E-mail",
        emailCodeDesc: "Enviaremos un código de verificación a tu e-mail",
        sendCode: "Enviar Código",
        codeSent: "¡Código enviado!",
        changePasswordTitle: "Cambiar Contraseña",
        changePasswordDesc: "Actualiza tu contraseña de acceso",
        currentPassword: "Contraseña Actual",
        newPassword: "Nueva Contraseña",
        changePassword: "Cambiar Contraseña",
        changingPassword: "Cambiando...",
        passwordChanged: "¡Contraseña cambiada con éxito!",
        changeEmailTitle: "Cambiar E-mail",
        changeEmailDesc: "Actualiza tu dirección de correo",
        newEmail: "Nuevo E-mail",
        changeEmailStep1: "Primero, enviaremos un código a tu correo actual",
        changeEmailStep2: "Ingresa el código enviado a tu correo actual",
        changeEmailStep3: "Ingresa tu nuevo correo y el código de verificación",
        requestChange: "Solicitar Cambio",
        confirmEmail: "Confirmar E-mail",
        changingEmail: "Cambiando...",
        emailChanged: "¡E-mail cambiado con éxito!",
        regenerateCodes: "Regenerar Códigos",
        regenerateCodesDesc: "Genera nuevos códigos de recuperación",
        regenerating: "Regenerando...",
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
    const imgRef = useRef<HTMLImageElement>(null);
    const [uploading, setUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();

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

    // Email verification code for 2FA (verify + disable)
    const [emailCode, setEmailCode] = useState("");
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);

    // Change password state
    const [cpCurrentPassword, setCpCurrentPassword] = useState("");
    const [cpNewPassword, setCpNewPassword] = useState("");
    const [cpEmailCode, setCpEmailCode] = useState("");
    const [cpLoading, setCpLoading] = useState(false);
    const [cpError, setCpError] = useState("");
    const [cpSuccess, setCpSuccess] = useState("");
    const [cpCodeSent, setCpCodeSent] = useState(false);

    // Change email state
    type EmailStep = "idle" | "verify-old" | "confirm-new";
    const [emailStep, setEmailStep] = useState<EmailStep>("idle");
    const [ceOldCode, setCeOldCode] = useState("");
    const [ceNewEmail, setCeNewEmail] = useState("");
    const [ceNewCode, setCeNewCode] = useState("");
    const [ceTempToken, setCeTempToken] = useState("");
    const [ceLoading, setCeLoading] = useState(false);
    const [ceError, setCeError] = useState("");
    const [ceSuccess, setCeSuccess] = useState("");

    useEffect(() => {
        setIs2FAEnabled(user?.twoFactorEnabled || false);
    }, [user?.twoFactorEnabled]);

    const countryData = user?.country ? getCountryData(user.country) : null;

    // ─── Image Crop ─────────────────────────────────────────────────────
    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
        const c = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width,
            height
        );
        setCrop(c);
        setCompletedCrop(c);
    }, []);

    const getCroppedBlob = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const image = imgRef.current;
            if (!image || !completedCrop) {
                resolve(null);
                return;
            }

            const canvas = document.createElement('canvas');
            const outputSize = 400; // 400x400 output
            canvas.width = outputSize;
            canvas.height = outputSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(null); return; }

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            const cropX = (completedCrop.x || 0) * scaleX;
            const cropY = (completedCrop.y || 0) * scaleY;
            const cropWidth = (completedCrop.width || 0) * scaleX;
            const cropHeight = (completedCrop.height || 0) * scaleY;

            ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, outputSize, outputSize);

            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
        });
    }, [completedCrop]);

    // ─── Profile Photo Upload ───────────────────────────────────────────
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            alert(t.photoRequirements);
            return;
        }

        // Open crop modal
        const reader = new FileReader();
        reader.onloadend = () => {
            setCropImageSrc(reader.result as string);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const handleCropConfirm = async () => {
        const blob = await getCroppedBlob();
        if (!blob) return;

        setShowCropModal(false);
        setPhotoPreview(URL.createObjectURL(blob));
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", blob, "profile.jpg");
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
            setCropImageSrc(null);
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
        if (verifyCode.length !== 6 || emailCode.length !== 6) return;
        setTwoFALoading(true);
        setTwoFAError("");
        try {
            await api.post("/auth/2fa/verify", { code: verifyCode, emailCode });
            setIs2FAEnabled(true);
            setTwoFAStep("backup");
            setTwoFASuccess(t.success);
            setEmailCode("");
            setEmailCodeSent(false);
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
                emailCode,
            });
            setIs2FAEnabled(false);
            setTwoFAStep("idle");
            setDisablePassword("");
            setDisableCode("");
            setEmailCode("");
            setEmailCodeSent(false);
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

    // ─── Send Security Code ─────────────────────────────────────────────
    const sendSecurityCode = async () => {
        setSendingCode(true);
        try {
            await api.post("/auth/send-security-code");
            setEmailCodeSent(true);
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || "Failed to send code");
        } finally {
            setSendingCode(false);
        }
    };

    // ─── Change Password ────────────────────────────────────────────────
    const sendCpCode = async () => {
        setSendingCode(true);
        try {
            await api.post("/auth/send-security-code");
            setCpCodeSent(true);
        } catch (err: any) {
            setCpError(err.response?.data?.message || "Failed to send code");
        } finally {
            setSendingCode(false);
        }
    };

    const handleChangePassword = async () => {
        setCpLoading(true);
        setCpError("");
        try {
            await api.post("/auth/change-password", {
                currentPassword: cpCurrentPassword,
                newPassword: cpNewPassword,
                emailCode: cpEmailCode,
            });
            setCpSuccess(t.passwordChanged);
            setCpCurrentPassword("");
            setCpNewPassword("");
            setCpEmailCode("");
            setCpCodeSent(false);
        } catch (err: any) {
            setCpError(err.response?.data?.message || t.error);
        } finally {
            setCpLoading(false);
        }
    };

    // ─── Change Email ───────────────────────────────────────────────────
    const handleChangeEmailRequest = async () => {
        setCeLoading(true);
        setCeError("");
        try {
            await api.post("/auth/change-email/request");
            setEmailStep("verify-old");
        } catch (err: any) {
            setCeError(err.response?.data?.message || t.error);
        } finally {
            setCeLoading(false);
        }
    };

    const handleChangeEmailVerifyOld = async () => {
        setCeLoading(true);
        setCeError("");
        try {
            const res = await api.post("/auth/change-email/verify-old", { code: ceOldCode });
            setCeTempToken(res.data.tempToken);
            setEmailStep("confirm-new");
        } catch (err: any) {
            setCeError(err.response?.data?.message || t.error);
        } finally {
            setCeLoading(false);
        }
    };

    const handleChangeEmailConfirm = async () => {
        setCeLoading(true);
        setCeError("");
        try {
            await api.post("/auth/change-email/send-new-code", { newEmail: ceNewEmail, tempToken: ceTempToken });
            // Small delay then confirm
        } catch (err: any) {
            setCeError(err.response?.data?.message || t.error);
            setCeLoading(false);
            return;
        }
        // Now confirm with code
        try {
            await api.post("/auth/change-email/confirm", {
                newEmail: ceNewEmail,
                newEmailCode: ceNewCode,
                tempToken: ceTempToken,
            });
            setCeSuccess(t.emailChanged);
            setEmailStep("idle");
            setCeOldCode("");
            setCeNewEmail("");
            setCeNewCode("");
            if (user) login(null, { ...user, email: ceNewEmail });
        } catch (err: any) {
            setCeError(err.response?.data?.message || t.error);
        } finally {
            setCeLoading(false);
        }
    };

    // ─── Regenerate Codes ────────────────────────────────────────────────
    const handleRegenerateCodes = async () => {
        setTwoFALoading(true);
        setTwoFAError("");
        try {
            const res = await api.post("/auth/2fa/regenerate-codes", {
                totpCode: verifyCode || undefined,
                emailCode: emailCode || undefined,
            });
            setBackupCodes(res.data.backupCodes);
            setTwoFAStep("backup");
            setVerifyCode("");
            setEmailCode("");
            setEmailCodeSent(false);
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || t.error);
        } finally {
            setTwoFALoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>

            {/* Crop Modal */}
            {showCropModal && cropImageSrc && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CropIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {lang === 'PT' ? 'Recortar Foto' : lang === 'ES' ? 'Recortar Foto' : lang === 'FR' ? 'Recadrer la Photo' : 'Crop Photo'}
                                </h3>
                            </div>
                            <button onClick={() => { setShowCropModal(false); setCropImageSrc(null); }}>
                                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                            </button>
                        </div>
                        <div className="flex justify-center mb-4">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    src={cropImageSrc}
                                    alt="Crop"
                                    onLoad={onImageLoad}
                                    className="max-h-[60vh] rounded-lg"
                                />
                            </ReactCrop>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => { setShowCropModal(false); setCropImageSrc(null); }} className="dark:border-slate-700">
                                {t.cancel}
                            </Button>
                            <Button onClick={handleCropConfirm} className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                                {t.confirm}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                                onChange={handlePhotoSelect}
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
                            <Button variant="outline" onClick={() => { setTwoFAStep("disable"); setTwoFAError(""); setTwoFASuccess(""); setEmailCode(""); setEmailCodeSent(false); }} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                                <ShieldX className="h-4 w-4 mr-2" />
                                {t.disable2FA}
                            </Button>
                            <Button variant="outline" onClick={() => { setTwoFAStep("reset"); setTwoFAError(""); setTwoFASuccess(""); }} className="dark:border-slate-700 dark:hover:bg-slate-800">
                                {t.reset2FA}
                            </Button>
                            <Button variant="outline" onClick={handleRegenerateCodes} disabled={twoFALoading} className="dark:border-slate-700 dark:hover:bg-slate-800">
                                {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                                {t.regenerateCodes}
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
                                <Input
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="font-mono text-center text-lg tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.emailCode}</Label>
                                <p className="text-xs text-slate-400">{t.emailCodeDesc}</p>
                                <div className="flex gap-2">
                                    <Input
                                        value={emailCode}
                                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="font-mono text-center tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    <Button variant="outline" onClick={sendSecurityCode} disabled={sendingCode || emailCodeSent} className="dark:border-slate-700 shrink-0">
                                        {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : emailCodeSent ? t.codeSent : t.sendCode}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => { setTwoFAStep("idle"); setVerifyCode(""); setEmailCode(""); setEmailCodeSent(false); setTwoFAError(""); }}>
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleVerify2FA} disabled={verifyCode.length !== 6 || emailCode.length !== 6 || twoFALoading} className="bg-black text-white dark:bg-white dark:text-black">
                                    {twoFALoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {t.verify}
                                </Button>
                            </div>
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
                            <div className="space-y-1.5">
                                <Label>{t.emailCode}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={emailCode}
                                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="font-mono text-center tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    <Button variant="outline" onClick={sendSecurityCode} disabled={sendingCode || emailCodeSent} className="dark:border-slate-700 shrink-0">
                                        {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : emailCodeSent ? t.codeSent : t.sendCode}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => { setTwoFAStep("idle"); setTwoFAError(""); setEmailCode(""); setEmailCodeSent(false); }} className="dark:border-slate-700">
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleDisable2FA} disabled={!disablePassword || disableCode.length !== 6 || emailCode.length !== 6 || twoFALoading} variant="destructive">
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
            {/* Change Password Card */}
            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-slate-500" />
                        <div>
                            <CardTitle>{t.changePasswordTitle}</CardTitle>
                            <CardDescription>{t.changePasswordDesc}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cpError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{cpError}</div>}
                    {cpSuccess && <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2"><Check className="h-4 w-4 shrink-0" />{cpSuccess}</div>}
                    <div className="space-y-1.5">
                        <Label>{t.currentPassword}</Label>
                        <Input type="password" value={cpCurrentPassword} onChange={(e) => setCpCurrentPassword(e.target.value)} className="dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>{t.newPassword}</Label>
                        <Input type="password" value={cpNewPassword} onChange={(e) => setCpNewPassword(e.target.value)} className="dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>{t.emailCode}</Label>
                        <div className="flex gap-2">
                            <Input value={cpEmailCode} onChange={(e) => setCpEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="font-mono text-center tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700" />
                            <Button variant="outline" onClick={sendCpCode} disabled={sendingCode || cpCodeSent} className="dark:border-slate-700 shrink-0">
                                {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : cpCodeSent ? t.codeSent : t.sendCode}
                            </Button>
                        </div>
                    </div>
                    <Button onClick={handleChangePassword} disabled={!cpCurrentPassword || cpNewPassword.length < 8 || cpEmailCode.length !== 6 || cpLoading} className="bg-black text-white dark:bg-white dark:text-black">
                        {cpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {cpLoading ? t.changingPassword : t.changePassword}
                    </Button>
                </CardContent>
            </Card>

            {/* Change Email Card */}
            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-slate-500" />
                        <div>
                            <CardTitle>{t.changeEmailTitle}</CardTitle>
                            <CardDescription>{t.changeEmailDesc}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {ceError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{ceError}</div>}
                    {ceSuccess && <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2"><Check className="h-4 w-4 shrink-0" />{ceSuccess}</div>}

                    {emailStep === "idle" && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500">{t.changeEmailStep1}</p>
                            <Button onClick={handleChangeEmailRequest} disabled={ceLoading} className="bg-black text-white dark:bg-white dark:text-black">
                                {ceLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {t.requestChange}
                            </Button>
                        </div>
                    )}

                    {emailStep === "verify-old" && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500">{t.changeEmailStep2}</p>
                            <div className="space-y-1.5">
                                <Label>{t.emailCode}</Label>
                                <Input value={ceOldCode} onChange={(e) => setCeOldCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="font-mono text-center tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => { setEmailStep("idle"); setCeError(""); }} className="dark:border-slate-700">{t.cancel}</Button>
                                <Button onClick={handleChangeEmailVerifyOld} disabled={ceOldCode.length !== 6 || ceLoading} className="bg-black text-white dark:bg-white dark:text-black">
                                    {ceLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {t.confirm}
                                </Button>
                            </div>
                        </div>
                    )}

                    {emailStep === "confirm-new" && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500">{t.changeEmailStep3}</p>
                            <div className="space-y-1.5">
                                <Label>{t.newEmail}</Label>
                                <Input type="email" value={ceNewEmail} onChange={(e) => setCeNewEmail(e.target.value)} className="dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>{t.emailCode}</Label>
                                <Input value={ceNewCode} onChange={(e) => setCeNewCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="font-mono text-center tracking-[0.5em] dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => { setEmailStep("idle"); setCeError(""); }} className="dark:border-slate-700">{t.cancel}</Button>
                                <Button onClick={handleChangeEmailConfirm} disabled={!ceNewEmail || ceNewCode.length !== 6 || ceLoading} className="bg-black text-white dark:bg-white dark:text-black">
                                    {ceLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {t.confirmEmail}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
