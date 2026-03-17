"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'PASSWORD' | 'TWO_FACTOR' | 'EMAIL_CODE' | 'NEW_PASSWORD' | 'SUCCESS';

function getPasswordStrength(password: string) {
    const checks = {
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score, isValid: checks.minLength && score >= 4 };
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [step, setStep] = useState<Step>('PASSWORD');
    const [loading, setLoading] = useState(false);
    const user = useAuthStore((state) => state.user);

    // Form data
    const [currentPassword, setCurrentPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

    const handleCurrentPasswordSubmit = async () => {
        if (!currentPassword) return;
        setLoading(true);
        try {
            await api.post('/auth/login', { email: user?.email, password: currentPassword });

            if (user?.twoFactorEnabled) {
                setStep('TWO_FACTOR');
            } else {
                // Send email code
                await api.post('/auth/send-security-code');
                setStep('EMAIL_CODE');
            }
        } catch (error) {
            toast.error("Senha atual incorreta.");
        } finally {
            setLoading(false);
        }
    };

    const handleTotpSubmit = () => {
        if (totpCode.length !== 6) return;
        setStep('NEW_PASSWORD');
    };

    const handleEmailCodeSubmit = () => {
        if (emailCode.length !== 6) return;
        setStep('NEW_PASSWORD');
    };

    const handleNewPasswordSubmit = async () => {
        if (!strength.isValid) {
            toast.error("A senha não atende os requisitos mínimos de segurança.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                currentPassword,
                newPassword,
            };

            if (user?.twoFactorEnabled) {
                payload.totpCode = totpCode;
            } else {
                payload.emailCode = emailCode;
            }

            await api.post('/auth/change-password', payload);
            setStep('SUCCESS');
            toast.success("Senha alterada com sucesso!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao alterar senha.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('PASSWORD');
        setCurrentPassword("");
        setTotpCode("");
        setEmailCode("");
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') action();
    };

    const strengthColor = strength.score <= 2 ? 'bg-red-500' : strength.score <= 3 ? 'bg-yellow-500' : 'bg-emerald-500';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>
                        {step === 'PASSWORD' && "Digite sua senha atual para começar."}
                        {step === 'TWO_FACTOR' && "Confirme sua identidade com o código 2FA."}
                        {step === 'EMAIL_CODE' && "Digite o código enviado para seu e-mail."}
                        {step === 'NEW_PASSWORD' && "Crie uma nova senha forte."}
                        {step === 'SUCCESS' && "Senha atualizada com sucesso!"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 'PASSWORD' && (
                        <div className="space-y-2">
                            <Label>Senha Atual</Label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, handleCurrentPasswordSubmit)}
                                autoComplete="new-password"
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

                    {step === 'EMAIL_CODE' && (
                        <div className="space-y-2">
                            <Label>Código de E-mail</Label>
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

                    {step === 'NEW_PASSWORD' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nova Senha</Label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password strength indicator */}
                            {newPassword && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        <span className={strength.checks.minLength ? 'text-emerald-600' : 'text-slate-400'}>
                                            {strength.checks.minLength ? '✓' : '○'} 8+ caracteres
                                        </span>
                                        <span className={strength.checks.hasUpper ? 'text-emerald-600' : 'text-slate-400'}>
                                            {strength.checks.hasUpper ? '✓' : '○'} Maiúscula
                                        </span>
                                        <span className={strength.checks.hasLower ? 'text-emerald-600' : 'text-slate-400'}>
                                            {strength.checks.hasLower ? '✓' : '○'} Minúscula
                                        </span>
                                        <span className={strength.checks.hasNumber ? 'text-emerald-600' : 'text-slate-400'}>
                                            {strength.checks.hasNumber ? '✓' : '○'} Número
                                        </span>
                                        <span className={strength.checks.hasSpecial ? 'text-emerald-600' : 'text-slate-400'}>
                                            {strength.checks.hasSpecial ? '✓' : '○'} Especial (!@#$)
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Confirmar Nova Senha</Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, handleNewPasswordSubmit)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="text-xs text-red-500">As senhas não coincidem</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'PASSWORD' && (
                        <Button onClick={handleCurrentPasswordSubmit} disabled={!currentPassword || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Continuar"}
                        </Button>
                    )}
                    {step === 'TWO_FACTOR' && (
                        <Button onClick={handleTotpSubmit} disabled={totpCode.length !== 6}>
                            Continuar
                        </Button>
                    )}
                    {step === 'EMAIL_CODE' && (
                        <Button onClick={handleEmailCodeSubmit} disabled={emailCode.length !== 6}>
                            Continuar
                        </Button>
                    )}
                    {step === 'NEW_PASSWORD' && (
                        <Button onClick={handleNewPasswordSubmit} disabled={!strength.isValid || newPassword !== confirmPassword || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Alterar Senha"}
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
