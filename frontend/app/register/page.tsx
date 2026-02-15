"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ArrowLeft, Check, Upload, Mail, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries, getCountryData } from "@/lib/countries";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useLanguage } from "@/app/context/LanguageContext";
import { validateCompanyID, formatCompanyID } from "@/lib/validators";

const PasswordStrengthMeter = ({ password, labels }: { password: string, labels: string[] }) => {
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = getStrength(password);
    const colors = ["bg-slate-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

    return (
        <div className="space-y-2">
            <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${strength >= level ? colors[strength] : 'bg-slate-100'}`}
                    />
                ))}
            </div>
            <p className={`text-xs text-right font-medium ${strength > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                {strength > 0 ? labels[strength - 1] : ''}
            </p>
        </div>
    );
};

export default function RegisterPage() {
    const router = useRouter();
    const { t, language } = useLanguage();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [country, setCountry] = useState("BR");
    const [currency, setCurrency] = useState("BRL");
    const [name, setName] = useState("");
    const [docNumber, setDocNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [idValidation, setIdValidation] = useState<{ isValid: boolean; message: string } | null>(null);
    const [verificationToken, setVerificationToken] = useState("");
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    const handleIdBlur = () => {
        if (!docNumber) {
            setIdValidation(null);
            return;
        }

        const isValid = validateCompanyID(docNumber, country);
        if (isValid) {
            setIdValidation({ isValid: true, message: "ID Válido" });
        } else {
            setIdValidation({ isValid: false, message: country === 'BR' ? "CNPJ Inválido" : `ID Inválido` });
        }
    };

    const countryData = getCountryData(country);

    const handleCountryChange = (value: string) => {
        const selected = getCountryData(value);
        setCountry(selected.code);
        setCurrency(selected.currency);
        setDocNumber("");
        setIdValidation(null);
    };

    // --- Handlers ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError("");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocumentUrl(res.data.url);
        } catch (err: any) {
            setError("Erro ao enviar documento.");
        } finally {
            setUploading(false);
        }
    };

    // Countdown timer effect
    useEffect(() => {
        if (timer <= 0) {
            setCanResend(true);
            return;
        }
        setCanResend(false);
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const startTimer = () => {
        setTimer(15 * 60); // 15 minutes
        setCanResend(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/send-verification", { email, language });
            startTimer();
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Erro ao enviar código.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/send-verification", { email, language });
            startTimer();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Erro ao reenviar código.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/auth/verify-code", { email, code: verificationCode });
            setVerificationToken(response.data.verificationToken);
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Código inválido.");
        } finally {
            setLoading(false);
        }
    };

    const handleStep3Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(4);
    };

    const handleStep4Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !docNumber) {
            setError("Preencha todos os campos.");
            return;
        }

        const isValid = validateCompanyID(docNumber, country);
        if (!isValid) {
            setError(country === 'BR' ? "CNPJ Inválido" : `ID (${countryData.docLabel}) Inválido`);
            return;
        }

        if (!documentUrl) {
            setError("Envie o comprovante da empresa.");
            return;
        }
        setStep(5);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t.register.passwordMatch);
            return;
        }
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/register", {
                name, docNumber, email, password, country, fiatCurrency: currency, documentUrl, verificationToken
            });
            router.push("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Erro ao criar conta.");
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---
    return (
        <AuthLayout type="register" currentStep={step}>
            <div className="mb-6">
                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`h-1.5 rounded-full flex-1 transition-all ${s <= step ? 'bg-black dark:bg-white' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                    ))}
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        {step === 1 && t.register.step1Title}
                        {step === 2 && t.register.step2Title}
                        {step === 3 && t.register.step3Title}
                        {step === 4 && t.register.step4Title}
                        {step === 5 && t.register.step5Title}
                    </h2>
                    <p className="text-slate-500 text-lg">
                        {step === 1 && t.register.step1Subtitle}
                        {step === 2 && `${t.register.step2Subtitle} ${email}`}
                        {step === 3 && t.register.step3Subtitle}
                        {step === 4 && t.register.step4Subtitle}
                        {step === 5 && t.register.step5Subtitle}
                    </p>
                </div>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">{t.register.emailLabel}</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                placeholder={t.register.placeholderEmail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 pl-12 rounded-full border-slate-200 bg-slate-50 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                    <Button type="submit" className="h-14 w-full bg-black text-white rounded-full font-bold hover:bg-slate-800 transition-all text-base" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>{t.register.sendButton} <ArrowRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                </form>
            )}

            {/* Step 2: Code */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-semibold text-slate-700 ml-1">{t.register.codeLabel}</Label>
                        <Input
                            id="code"
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            className="h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-full border-slate-200 bg-slate-50 text-slate-900 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                            maxLength={6}
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                    {/* Countdown timer */}
                    {timer > 0 && (
                        <div className="text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {(t.register as any).codeExpires} <span className="font-mono font-bold text-slate-900 dark:text-white">{formatTime(timer)}</span>
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-14 w-14 rounded-full border-slate-200 hover:bg-slate-50 p-0 flex items-center justify-center shrink-0">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Button>
                        <Button type="submit" className="h-14 flex-1 bg-black text-white rounded-full font-bold hover:bg-slate-800 transition-all text-base" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t.register.verifyButton}
                        </Button>
                    </div>

                    {/* Resend button */}
                    {canResend && timer <= 0 && (
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={loading}
                            className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline transition-colors w-full text-center"
                        >
                            {(t.register as any).resendCode}
                        </button>
                    )}
                </form>
            )}

            {/* Step 3: Country & Currency */}
            {step === 3 && (
                <form onSubmit={handleStep3Submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 ml-1">{t.register.country}</Label>
                        <Select value={country} onValueChange={handleCountryChange}>
                            <SelectTrigger className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 focus:ring-2 focus:ring-black focus:ring-offset-0 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus:ring-white">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {countries.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        <span className="font-emoji mr-2">{c.flag}</span> {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 ml-1">{t.register.currency}</Label>
                        <Input value={currency} disabled className="h-14 rounded-full border-slate-200 bg-slate-100 px-6 text-base text-slate-500" />
                    </div>
                    <Button type="submit" className="h-14 w-full bg-black text-white rounded-full font-bold hover:bg-slate-800 transition-all text-base">
                        {t.register.nextButton} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </form>
            )}

            {/* Step 4: Details */}
            {step === 4 && (
                <form onSubmit={handleStep4Submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">{t.register.companyName}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                    </div>


                    <div className="space-y-2">
                        <Label htmlFor="docNumber" className="text-sm font-semibold text-slate-700 ml-1">{countryData.docLabel}</Label>
                        <div className="relative">
                            <Input
                                id="docNumber"
                                placeholder={countryData.docPlaceholder}
                                value={docNumber}
                                onChange={(e) => {
                                    const rawVal = e.target.value;
                                    if (countryData.mask) {
                                        const formatted = formatCompanyID(rawVal, countryData.mask);
                                        setDocNumber(formatted);
                                    } else {
                                        setDocNumber(rawVal.slice(0, countryData.maxLength));
                                    }
                                    // Clear validation state on type to avoid confusion
                                    if (idValidation) setIdValidation(null);
                                }}
                                onBlur={handleIdBlur}
                                required
                                className={`h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-offset-0 ${idValidation?.isValid === false ? 'border-red-500 focus-visible:ring-red-500' :
                                    idValidation?.isValid === true ? 'border-green-500 focus-visible:ring-green-500' :
                                        'focus-visible:ring-black dark:focus-visible:ring-white'
                                    }`}
                                maxLength={countryData.maxLength}
                            />
                            {idValidation?.isValid && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        {idValidation?.isValid === false && (
                            <p className="text-xs text-red-500 ml-2 font-medium">{idValidation.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="document" className="text-sm font-semibold text-slate-700 ml-1">
                            {t.register.documentUploadLabel} <span className="text-slate-400 font-normal">({countryData.companyDocLabel})</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="document"
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <label
                                htmlFor="document"
                                className={`flex items-center justify-between h-14 w-full rounded-full border-2 border-dashed px-6 cursor-pointer transition-all ${documentUrl ? 'border-black bg-slate-50 dark:border-white dark:bg-slate-900' : 'border-slate-300 hover:border-slate-400 bg-slate-50 dark:bg-slate-900 dark:border-slate-700'}`}
                            >
                                <span className={`text-sm ${documentUrl ? 'text-black dark:text-white font-medium' : 'text-slate-500'}`}>
                                    {documentUrl ? "Documento Enviado" : t.register.documentUploadHint}
                                </span>
                                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" /> :
                                    documentUrl ? <Check className="h-5 w-5 text-black dark:text-white" /> :
                                        <Upload className="h-5 w-5 text-slate-400" />
                                }
                            </label>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(3)} className="h-14 w-14 rounded-full border-slate-200 hover:bg-slate-50 p-0 flex items-center justify-center shrink-0">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Button>
                        <Button type="submit" className="h-14 flex-1 bg-black text-white rounded-full font-bold hover:bg-slate-800 transition-all text-base" disabled={uploading}>
                            {t.register.nextButton} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </form>
            )}

            {/* Step 5: Password */}
            {step === 5 && (
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">{t.register.passwordLabel}</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                        <PasswordStrengthMeter password={password} labels={t.register.passwordStrength} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 ml-1">{t.register.confirmPasswordLabel}</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-14 rounded-full border-slate-200 bg-slate-50 px-6 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(4)} className="h-14 w-14 rounded-full border-slate-200 hover:bg-slate-50 p-0 flex items-center justify-center shrink-0">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Button>
                        <Button type="submit" className="h-14 flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-bold shadow-lg shadow-orange-500/20 transition-all text-base" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t.register.submitButton}
                        </Button>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
