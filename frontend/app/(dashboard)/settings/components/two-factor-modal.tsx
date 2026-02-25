"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';

interface TwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step =
    | 'PASSWORD'
    | 'EMAIL_CODE'
    | 'SETUP_QR'
    | 'VERIFY_TOTP'
    | 'DISABLE_TOTP'
    | 'SUCCESS';

type Action = 'ENABLE' | 'DISABLE';

export function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const isEnabled = user?.twoFactorEnabled;

    const [step, setStep] = useState<Step>('PASSWORD');
    const [action, setAction] = useState<Action>(isEnabled ? 'DISABLE' : 'ENABLE');
    const [loading, setLoading] = useState(false);

    // Data
    const [password, setPassword] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const [qrUri, setQrUri] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    const handlePasswordSubmit = async () => {
        if (!password) return;
        setLoading(true);
        try {
            // Validate password via login
            await api.post('/auth/login', { email: user?.email, password });

            const currentAction = isEnabled ? 'DISABLE' : 'ENABLE';
            setAction(currentAction);

            if (currentAction === 'ENABLE') {
                // For enabling: if no 2FA, send email code for verification
                await api.post('/auth/send-security-code');
                setStep('EMAIL_CODE');
            } else {
                // For disabling: user has 2FA enabled, so ask for TOTP code
                setStep('DISABLE_TOTP');
            }
        } catch (error) {
            toast.error("Senha incorreta.");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailCodeSubmit = async () => {
        if (emailCode.length !== 6) return;
        setLoading(true);
        try {
            // Start 2FA setup
            const res = await api.post('/auth/2fa/setup');
            setQrUri(res.data.otpauthUrl || res.data.otpAuthUrl);
            if (res.data.backupCodes) {
                setBackupCodes(res.data.backupCodes);
            }
            setStep('SETUP_QR');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao iniciar configuração.");
        } finally {
            setLoading(false);
        }
    };

    const handleSetupVerify = async () => {
        if (totpCode.length !== 6) return;
        setLoading(true);
        try {
            await api.post('/auth/2fa/verify', { code: totpCode, emailCode });
            updateUser({ twoFactorEnabled: true });
            setStep('SUCCESS');
            toast.success("2FA ativado com sucesso!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Código inválido.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (totpCode.length !== 6) return;
        setLoading(true);
        try {
            await api.post('/auth/2fa/disable', { password, code: totpCode });
            updateUser({ twoFactorEnabled: false });
            setStep('SUCCESS');
            toast.success("2FA desativado com sucesso.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao desativar.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('PASSWORD');
        setPassword("");
        setEmailCode("");
        setTotpCode("");
        setQrUri("");
        setBackupCodes([]);
        setAction(isEnabled ? 'DISABLE' : 'ENABLE');
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') action();
    };

    const getTitle = () => {
        if (step === 'SUCCESS') return action === 'ENABLE' ? '2FA Ativado' : '2FA Desativado';
        return isEnabled ? 'Desativar 2FA' : 'Ativar 2FA';
    };

    const getDescription = () => {
        switch (step) {
            case 'PASSWORD': return "Confirme sua senha para continuar.";
            case 'EMAIL_CODE': return "Digite o código enviado para seu e-mail.";
            case 'SETUP_QR': return "Escaneie o QR Code com seu aplicativo autenticador (Google Authenticator, Authy, etc) e insira o código gerado.";
            case 'VERIFY_TOTP': return "Insira o código gerado pelo aplicativo.";
            case 'DISABLE_TOTP': return "Digite o código do seu aplicativo autenticador para confirmar a desativação.";
            case 'SUCCESS': return action === 'ENABLE' ? "Sua conta agora está protegida com 2FA!" : "O 2FA foi desativado da sua conta.";
            default: return "";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogDescription>{getDescription()}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 'PASSWORD' && (
                        <div className="space-y-2">
                            <Label>Senha Atual</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, handlePasswordSubmit)}
                                autoComplete="new-password"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'EMAIL_CODE' && (
                        <div className="space-y-2">
                            <Label>Código de Verificação (E-mail)</Label>
                            <Input
                                value={emailCode}
                                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                                maxLength={6}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest"
                                onKeyDown={(e) => handleKeyDown(e, handleEmailCodeSubmit)}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'SETUP_QR' && (
                        <div className="flex flex-col items-center space-y-4">
                            {qrUri ? (
                                <div className="p-4 bg-white border rounded-xl">
                                    <QRCodeSVG value={qrUri} size={192} />
                                </div>
                            ) : (
                                <Loader2 className="animate-spin" />
                            )}
                            <div className="w-full space-y-2">
                                <Label>Código Gerado pelo App</Label>
                                <Input
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    placeholder="000000"
                                    className="text-center text-2xl tracking-widest"
                                    onKeyDown={(e) => handleKeyDown(e, handleSetupVerify)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {step === 'DISABLE_TOTP' && (
                        <div className="space-y-2">
                            <Label>Código 2FA</Label>
                            <Input
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                maxLength={6}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest"
                                onKeyDown={(e) => handleKeyDown(e, handleDisable)}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            {action === 'ENABLE' ? (
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            ) : (
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                    <XCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'PASSWORD' && (
                        <Button onClick={handlePasswordSubmit} disabled={!password || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Continuar"}
                        </Button>
                    )}
                    {step === 'EMAIL_CODE' && (
                        <Button onClick={handleEmailCodeSubmit} disabled={emailCode.length !== 6 || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Continuar"}
                        </Button>
                    )}
                    {step === 'SETUP_QR' && (
                        <Button onClick={handleSetupVerify} disabled={totpCode.length !== 6 || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Ativar"}
                        </Button>
                    )}
                    {step === 'DISABLE_TOTP' && (
                        <Button onClick={handleDisable} disabled={totpCode.length !== 6 || loading} variant="destructive">
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Desativar"}
                        </Button>
                    )}
                    {step === 'SUCCESS' && (
                        <Button onClick={reset} className="w-full">
                            Concluir
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
