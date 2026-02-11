"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", { email, password });
            const { user } = response.data;

            login(null, user);
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

    return (
        <AuthLayout type="login">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.login.title}</h2>
                <p className="text-slate-500">
                    {t.login.noAccount}{" "}
                    <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        {t.login.registerLink}
                    </Link>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">{t.login.emailLabel}</Label>
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
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">{t.login.passwordLabel}</Label>
                        <Link href="#" className="text-xs font-medium text-black dark:text-white hover:underline">
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
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
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
