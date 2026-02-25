"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface RecoveryCodesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'PASSWORD' | 'TWO_FACTOR' | 'WARNING' | 'CODES';

export function RecoveryCodesModal({ isOpen, onClose }: RecoveryCodesModalProps) {
    const user = useAuthStore((state) => state.user);
    const [step, setStep] = useState<Step>('PASSWORD');
    const [loading, setLoading] = useState(false);

    // Data
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [codes, setCodes] = useState<string[]>([]);
    const [confirmed, setConfirmed] = useState(false);
    const [copied, setCopied] = useState(false);

    const handlePasswordSubmit = async () => {
        if (!password) return;
        setLoading(true);
        try {
            // Validate password via login
            await api.post('/auth/login', { email: user?.email, password });
            setStep('TWO_FACTOR');
        } catch (error) {
            toast.error("Senha incorreta.");
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = () => {
        if (totpCode.length !== 6) return;
        // We only verify the TOTP code when calling the actual regenerate endpoint
        setStep('WARNING');
    };

    const handleRegenerate = async () => {
        if (!confirmed) return;
        setLoading(true);
        try {
            const res = await api.post('/auth/2fa/regenerate-codes', {
                password,
                totpCode,
            });
            setCodes(res.data.backupCodes);
            setStep('CODES');
            toast.success("Novos códigos gerados!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao gerar códigos.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const text = codes.join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Códigos copiados!");
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => {
        setStep('PASSWORD');
        setPassword("");
        setTotpCode("");
        setCodes([]);
        setConfirmed(false);
        setCopied(false);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') action();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Códigos de Recuperação</DialogTitle>
                    <DialogDescription>
                        {step === 'PASSWORD' && "Confirme sua senha para continuar."}
                        {step === 'TWO_FACTOR' && "Confirme sua identidade com o código 2FA."}
                        {step === 'WARNING' && "Leia atentamente antes de continuar."}
                        {step === 'CODES' && "Guarde estes códigos em local seguro. Eles só serão mostrados uma vez."}
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
                                onKeyDown={(e) => handleKeyDown(e, handle2FASubmit)}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 'WARNING' && (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Aviso Importante</AlertTitle>
                                <AlertDescription className="space-y-2">
                                    <p>Ao gerar novos códigos, todos os códigos anteriores deixarão de funcionar.</p>
                                    <p>Estes códigos só serão mostrados <strong>uma única vez</strong>. Certifique-se de salvá-los em local seguro.</p>
                                    <p className="text-xs opacity-80">Quando todos os códigos forem usados, você receberá um e-mail avisando que precisa gerar novos nas configurações.</p>
                                </AlertDescription>
                            </Alert>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="confirm-codes" checked={confirmed} onCheckedChange={(c) => setConfirmed(!!c)} />
                                <Label htmlFor="confirm-codes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Estou ciente e confirmo que vou salvar os novos códigos.
                                </Label>
                            </div>
                        </div>
                    )}

                    {step === 'CODES' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm text-center">
                                {codes.map((code) => (
                                    <div key={code} className="py-1">{code}</div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full flex gap-2" onClick={copyToClipboard}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copiado!" : "Copiar Códigos"}
                            </Button>
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
                        <Button onClick={handle2FASubmit} disabled={totpCode.length !== 6}>
                            Continuar
                        </Button>
                    )}
                    {step === 'WARNING' && (
                        <Button onClick={handleRegenerate} disabled={!confirmed || loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Gerar Códigos"}
                        </Button>
                    )}
                    {step === 'CODES' && (
                        <Button onClick={reset} className="w-full">
                            Concluir
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
