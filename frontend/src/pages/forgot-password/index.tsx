"use client";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, CheckCircle2, Copy } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/forgot-password", { email });
            setSuccessMessage("Se o e-mail existir, um código foi enviado.");
            setStep(2);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erro ao enviar código.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", { email, code, newPassword });
            setSuccessMessage("Senha alterada com sucesso! Redirecionando...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erro ao redefinir senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout type="login">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Recuperar Senha</h2>
                <p className="text-slate-500">
                    {step === 1
                        ? "Digite seu e-mail para receber um código de recuperação."
                        : "Digite o código enviado e sua nova senha."}
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-600 border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    {successMessage}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleSendCode} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="h-14 w-full bg-slate-900 hover:bg-slate-800 text-base font-bold text-white shadow-lg shadow-slate-900/20 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                Enviar Código
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-semibold text-slate-700 ml-1">Código de Verificação</Label>
                        <div className="relative">
                            <Input
                                id="code"
                                type="text"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all tracking-widest text-center font-mono text-lg dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                            />
                            <Copy className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 ml-1">Nova Senha</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 ml-1">Confirmar Senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="h-14 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base font-bold text-white shadow-lg shadow-orange-500/20 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Redefinindo...
                            </>
                        ) : (
                            <>
                                Redefinir Senha
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            )}

            <div className="mt-8 text-center">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2 transition-colors">
                    ← Voltar para Login
                </Link>
            </div>
        </AuthLayout>
    );
}
