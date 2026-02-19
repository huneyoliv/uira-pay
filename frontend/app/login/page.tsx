"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useLanguage } from "@/app/context/LanguageContext";

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const { t } = useLanguage();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 2FA state
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [pendingUser, setPendingUser] = useState<any>(null);

    // Recovery code state
    const [useRecovery, setUseRecovery] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", { email, password });
            const data = response.data;

            if (data.requires2FA) {
                setRequires2FA(true);
                setTempToken(data.tempToken);
                setPendingUser(data.user);
                return;
            }

            login(null, data.user);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login failed", err);
            if (err.response?.status === 401) {
                setError(t.login.errorInvalid);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError(t.login.errorGeneric);
            }
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (totpCode.length !== 6) return;
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login/2fa", {
                tempToken,
                code: totpCode,
            });

            const user = response.data?.user || pendingUser;
            if (user) {
                login(null, user);
            }
            router.push("/dashboard");
        } catch (err: any) {
            console.error("2FA verification failed", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(t.login2fa.errorInvalidCode);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRecoverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recoveryCode.trim()) return;
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login/2fa-recovery", {
                tempToken,
                backupCode: recoveryCode.trim(),
            });

            const user = response.data?.user || pendingUser;
            if (user) {
                login(null, user);
            }
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Recovery failed", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(t.login2fa.recoveryError);
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── 2FA verification screen ──────────────────────────────────────
    if (requires2FA) {
        // Recovery code mode
        if (useRecovery) {
            return (
                <AuthLayout type="login">
                    <div className="mb-8">
                        <button
                            onClick={() => { setUseRecovery(false); setRecoveryCode(""); setError(""); }}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t.login2fa.back}
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center">
                                <KeyRound className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.login2fa.recoveryTitle}</h2>
                        </div>
                        <p className="text-slate-500">
                            {t.login2fa.recoverySubtitle}
                        </p>
                    </div>

                    <form onSubmit={handleRecoverySubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="recovery-code" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                {t.login2fa.recoveryCodeLabel}
                            </Label>
                            <Input
                                id="recovery-code"
                                type="text"
                                value={recoveryCode}
                                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                                placeholder={t.login2fa.recoveryCodePlaceholder}
                                required
                                autoFocus
                                className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-center text-lg font-mono tracking-widest text-slate-900 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                            />
                        </div>

                        {error && (
                            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="h-14 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base font-bold text-white shadow-lg shadow-orange-500/20 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading || !recoveryCode.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {t.login2fa.recovering}
                                </>
                            ) : (
                                <>
                                    {t.login2fa.recoveryButton}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => { setUseRecovery(false); setRecoveryCode(""); setError(""); }}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                                {t.login2fa.useAuthenticator}
                            </button>
                        </div>
                    </form>
                </AuthLayout>
            );
        }

        // TOTP code mode (default)
        return (
            <AuthLayout type="login">
                <div className="mb-8">
                    <button
                        onClick={() => { setRequires2FA(false); setTotpCode(""); setError(""); setUseRecovery(false); }}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t.login2fa.back}
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.login2fa.title}</h2>
                    </div>
                    <p className="text-slate-500">
                        {t.login2fa.subtitle}
                    </p>
                </div>

                <form onSubmit={handle2FASubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="totp-code" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            {t.login2fa.codeLabel}
                        </Label>
                        <Input
                            id="totp-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            required
                            autoFocus
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-center text-2xl font-mono tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                            <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="h-14 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base font-bold text-white shadow-lg shadow-orange-500/20 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={loading || totpCode.length !== 6}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {t.login2fa.verifying}
                            </>
                        ) : (
                            <>
                                {t.login2fa.verifyButton}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => { setUseRecovery(true); setTotpCode(""); setError(""); }}
                            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            {t.login2fa.useRecoveryCode}
                        </button>
                    </div>
                </form>
            </AuthLayout>
        );
    }

    // ─── Normal login form ────────────────────────────────────────────
    return (
        <AuthLayout type="login">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.login.title}</h2>
                <p className="text-slate-500">
                    {t.login.noAccount}{" "}
                    <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        {t.login.registerLink}
                    </Link>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{t.login.emailLabel}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t.login.placeholderEmail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1 mr-1">
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.login.passwordLabel}</Label>
                        <Link href="/forgot-password" className="text-xs font-medium text-black dark:text-white hover:underline">
                            {t.login.forgotPassword}
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="h-14 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base font-bold text-white shadow-lg shadow-orange-500/20 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t.login.loginLoading}
                        </>
                    ) : (
                        <>
                            {t.login.loginButton}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
