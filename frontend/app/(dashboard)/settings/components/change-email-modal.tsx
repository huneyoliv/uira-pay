"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ChangeEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'PASSWORD' | 'TWO_FACTOR' | 'OLD_EMAIL_CODE' | 'NEW_EMAIL' | 'NEW_EMAIL_CODE' | 'SUCCESS';

export function ChangeEmailModal({ isOpen, onClose }: ChangeEmailModalProps) {
    const [step, setStep] = useState<Step>('PASSWORD');
    const [loading, setLoading] = useState(false);
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);

    // Form data
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [oldEmailCode, setOldEmailCode] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newEmailCode, setNewEmailCode] = useState("");

    // Tokens
    const [tempToken, setTempToken] = useState("");

    // Resend cooldown
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);

    const startCooldown = useCallback(() => {
        setResendCooldown(60);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownRef.current) clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const handlePasswordSubmit = async () => {
        if (!password) return;
        setLoading(true);
        try {
            await api.post('/auth/login', { email: user?.email, password });

            if (user?.twoFactorEnabled) {
                setStep('TWO_FACTOR');
            } else {
                // Request code to old email
                await api.post('/auth/change-email/request');
                setStep('OLD_EMAIL_CODE');
            }
        } catch (error) {
            toast.error("Senha incorreta.");
        } finally {
            setLoading(false);
        }
    };

    const handleTotpSubmit = async () => {
        if (totpCode.length !== 6) return;
        setLoading(true);
        try {
            const res = await api.post('/auth/change-email/verify-old', { totpCode });
            setTempToken(res.data.tempToken);
            setStep('NEW_EMAIL');
        } catch (error) {
            toast.error("Código 2FA inválido.");
        } finally {
            setLoading(false);
        }
    };

    const handleOldEmailCodeSubmit = async () => {
        if (oldEmailCode.length !== 6) return;
        setLoading(true);
        try {
            const res = await api.post('/auth/change-email/verify-old', { code: oldEmailCode });
            setTempToken(res.data.tempToken);
            setStep('NEW_EMAIL');
        } catch (error) {
            toast.error("Código inválido.");
        } finally {
            setLoading(false);
        }
    };

    const handleNewEmailSubmit = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            toast.error("E-mail inválido.");
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-email/send-new-code', { newEmail, tempToken });
            startCooldown();
            setStep('NEW_EMAIL_CODE');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Falha ao enviar código.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            await api.post('/auth/change-email/send-new-code', { newEmail, tempToken });
            startCooldown();
            toast.success("Código reenviado!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao reenviar código.");
        } finally {
            setLoading(false);
        }
    };

    const handleNewEmailCodeSubmit = async () => {
        if (newEmailCode.length !== 6) return;
        setLoading(true);
        try {
            await api.post('/auth/change-email/confirm', {
                newEmail,
                newEmailCode,
                tempToken
            });
            updateUser({ email: newEmail });
            setStep('SUCCESS');
            toast.success("E-mail alterado com sucesso!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Código inválido.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('PASSWORD');
        setPassword("");
        setTotpCode("");
        setOldEmailCode("");
        setNewEmail("");
        setNewEmailCode("");
        setTempToken("");
        setResendCooldown(0);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') action();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Alterar E-mail</DialogTitle>
                    <DialogDescription>
                        {step === 'PASSWORD' && "Confirme sua senha atual para continuar."}
                        {step === 'TWO_FACTOR' && "Digite o código do seu aplicativo autenticador."}
                        {step === 'OLD_EMAIL_CODE' && "Digite o código que enviamos para seu e-mail atual."}
                        {step === 'NEW_EMAIL' && "Digite o novo endereço de e-mail."}
                        {step === 'NEW_EMAIL_CODE' && `Um código foi enviado para ${newEmail}. Digite-o abaixo.`}
                        {step === 'SUCCESS' && "E-mail alterado com sucesso!"}
                    </DialogDescription>
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
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'TWO_FACTOR' && (
                        <div className="space-y-2">
                            <Label>Código 2FA</Label>
                            <Input
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                maxLength={6}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest"
                                onKeyDown={(e) => handleKeyDown(e, handleTotpSubmit)}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'OLD_EMAIL_CODE' && (
                        <div className="space-y-2">
                            <Label>Código de Verificação</Label>
                            <Input
                                value={oldEmailCode}
                                onChange={(e) => setOldEmailCode(e.target.value.replace(/\D/g, ''))}
                                maxLength={6}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest"
                                onKeyDown={(e) => handleKeyDown(e, handleOldEmailCodeSubmit)}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'NEW_EMAIL' && (
                        <div className="space-y-2">
                            <Label>Novo E-mail</Label>
                            <Input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                onKeyDown={(e) => handleKeyDown(e, handleNewEmailSubmit)}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'NEW_EMAIL_CODE' && (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Código de Confirmação</Label>
                                <Input
                                    value={newEmailCode}
                                    onChange={(e) => setNewEmailCode(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    placeholder="000000"
                                    className="text-center text-2xl tracking-widest"
                                    onKeyDown={(e) => handleKeyDown(e, handleNewEmailCodeSubmit)}
                                    autoFocus
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-muted-foreground"
                                disabled={resendCooldown > 0 || loading}
                                onClick={handleResendCode}
                            >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {resendCooldown > 0
                                    ? `Reenviar em ${resendCooldown}s`
                                    : "Reenviar código"
                                }
                            </Button>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                Seu e-mail foi alterado para <strong>{newEmail}</strong>
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'PASSWORD' && (
                        <Button onClick={handlePasswordSubmit} disabled={!password || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Continuar"}
                        </Button>
                    )}
                    {step === 'TWO_FACTOR' && (
                        <Button onClick={handleTotpSubmit} disabled={totpCode.length !== 6 || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verificar"}
                        </Button>
                    )}
                    {step === 'OLD_EMAIL_CODE' && (
                        <Button onClick={handleOldEmailCodeSubmit} disabled={oldEmailCode.length !== 6 || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verificar"}
                        </Button>
                    )}
                    {step === 'NEW_EMAIL' && (
                        <Button onClick={handleNewEmailSubmit} disabled={!newEmail || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Enviar Código"}
                        </Button>
                    )}
                    {step === 'NEW_EMAIL_CODE' && (
                        <Button onClick={handleNewEmailCodeSubmit} disabled={newEmailCode.length !== 6 || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirmar Alteração"}
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
