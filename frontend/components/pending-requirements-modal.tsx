"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Loader2, AlertTriangle, Upload, Check, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { countries, getCountryData } from "@/lib/countries";
import { validateCompanyID, formatCompanyID } from "@/lib/validators";

export function PendingRequirementsModal() {
    const { user, login, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [country, setCountry] = useState("");
    const [fiatCurrency, setFiatCurrency] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [docNumber, setDocNumber] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [defaultCurrency, setDefaultCurrency] = useState("");
    const [currencyAcknowledged, setCurrencyAcknowledged] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [idValidation, setIdValidation] = useState<{ isValid: boolean; message: string } | null>(null);
    const router = useRouter();

    // Determine what's missing — open modal if company profile not completed
    const needsSetup = !user?.doc_number || user.doc_number.startsWith("PENDING-");

    useEffect(() => {
        if (!user) return;

        if (needsSetup) {
            setOpen(true);
            if (user.name) setCompanyName(user.name);
            if ((user as any).country) setCountry((user as any).country);
            if ((user as any).fiatCurrency) setFiatCurrency((user as any).fiatCurrency);
            if (user.default_currency) setDefaultCurrency(user.default_currency);
        }
    }, [user, needsSetup]);

    const handleCountryChange = (value: string) => {
        const selected = getCountryData(value);
        setCountry(selected.code);
        setFiatCurrency(selected.currency);
        // Clear doc number when country changes
        setDocNumber("");
        setIdValidation(null);
    };

    const countryData = country ? getCountryData(country) : null;

    const handleIdBlur = () => {
        if (!docNumber || !country) {
            setIdValidation(null);
            return;
        }

        const isValid = validateCompanyID(docNumber, country);
        if (isValid) {
            setIdValidation({ isValid: true, message: "ID Válido" });
        } else {
            setIdValidation({
                isValid: false,
                message: country === 'BR' ? "CNPJ Inválido" : "ID Inválido"
            });
        }
    };

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

    const handleSubmit = async () => {
        setError("");

        // Validations
        if (!country) { setError("Selecione o país."); return; }
        if (!companyName) { setError("O nome da empresa é obrigatório."); return; }
        if (!docNumber) { setError(`O ${countryData?.docLabel || 'documento'} é obrigatório.`); return; }

        const isValid = validateCompanyID(docNumber, country);
        if (!isValid) {
            setError(country === 'BR' ? "CNPJ Inválido" : `${countryData?.docLabel || 'Documento'} Inválido`);
            return;
        }
        if (!documentUrl) { setError("Envie o comprovante da empresa."); return; }
        if (!defaultCurrency) { setError("Selecione a moeda padrão (USDT ou USDC)."); return; }
        if (!currencyAcknowledged) { setError("Confirme que está ciente sobre a política de alteração."); return; }

        setLoading(true);

        try {
            await api.patch("/me/company-profile", {
                name: companyName,
                docNumber,
                documentUrl,
                country,
                fiatCurrency,
                defaultCurrency,
            });

            // Update local user
            if (user) {
                const updatedUser = {
                    ...user,
                    name: companyName,
                    doc_number: docNumber,
                    default_currency: defaultCurrency,
                    country,
                };

                const token = localStorage.getItem("auth-token");
                login(token, updatedUser);
            }
            setOpen(false);
        } catch (err: any) {
            if (err.response?.status === 401) {
                await logout();
                router.push("/login");
                return;
            }
            setError(err.response?.data?.message || "Erro ao salvar configurações.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && needsSetup) return;
        setOpen(newOpen);
    };

    const isFormComplete = () => {
        if (!country || !companyName || !docNumber || !documentUrl || !defaultCurrency || !currencyAcknowledged) return false;
        if (!validateCompanyID(docNumber, country)) return false;
        return true;
    };

    if (!open) return null;

    const isBR = country === 'BR';

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-[520px] bg-white dark:bg-zinc-950 max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        {isBR ? 'Complete seu Cadastro' : 'Complete Your Profile'}
                    </DialogTitle>
                    <DialogDescription>
                        {isBR ? 'Para acessar o painel, complete as informações da sua empresa.' : 'To access the dashboard, complete your company information.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Country Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {isBR ? 'País' : 'Country'}
                        </Label>
                        <Select value={country} onValueChange={handleCountryChange}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base focus:ring-2 focus:ring-black focus:ring-offset-0 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus:ring-white">
                                <SelectValue placeholder={isBR ? "Selecione o país" : "Select country"} />
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

                    {/* Fiat Currency (auto-filled from country) */}
                    {fiatCurrency && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {isBR ? 'Moeda Fiat' : 'Fiat Currency'}
                            </Label>
                            <Input value={fiatCurrency} disabled className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-base text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400" />
                        </div>
                    )}

                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {isBR ? 'Nome da Empresa' : 'Company Name'}
                        </Label>
                        <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={isBR ? 'Nome da sua empresa' : 'Your company name'}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-white"
                        />
                    </div>

                    {/* Document Number with validation */}
                    {countryData && (
                        <div className="space-y-2">
                            <Label htmlFor="docNumber" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {countryData.docLabel}
                            </Label>
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
                                        if (idValidation) setIdValidation(null);
                                    }}
                                    onBlur={handleIdBlur}
                                    className={`h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-offset-0 dark:bg-slate-900 dark:border-slate-800 dark:text-white ${idValidation?.isValid === false ? 'border-red-500 focus-visible:ring-red-500' :
                                        idValidation?.isValid === true ? 'border-green-500 focus-visible:ring-green-500' :
                                            'focus-visible:ring-black dark:focus-visible:ring-white'
                                        }`}
                                    maxLength={countryData.maxLength}
                                />
                                {idValidation?.isValid && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            {idValidation?.isValid === false && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{idValidation.message}</p>
                            )}
                        </div>
                    )}

                    {/* Document Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="companyDoc" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {isBR ? 'Comprovante da Empresa' : 'Company Document'}
                            {countryData && <span className="text-slate-400 font-normal ml-1">({countryData.companyDocLabel})</span>}
                        </Label>
                        <div className="relative">
                            <Input
                                id="companyDoc"
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <label
                                htmlFor="companyDoc"
                                className={`flex items-center justify-between h-12 w-full rounded-xl border-2 border-dashed px-4 cursor-pointer transition-all ${documentUrl ? 'border-black bg-slate-50 dark:border-white dark:bg-slate-900' : 'border-slate-300 hover:border-slate-400 bg-slate-50 dark:bg-slate-900 dark:border-slate-700'}`}
                            >
                                <span className={`text-sm ${documentUrl ? 'text-black dark:text-white font-medium' : 'text-slate-500'}`}>
                                    {documentUrl ? (isBR ? "Documento Enviado ✓" : "Document Uploaded ✓") : (isBR ? "Clique para enviar" : "Click to upload")}
                                </span>
                                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" /> :
                                    documentUrl ? <Check className="h-5 w-5 text-black dark:text-white" /> :
                                        <Upload className="h-5 w-5 text-slate-400" />
                                }
                            </label>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

                    {/* Default Crypto Currency */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {isBR ? 'Moeda Padrão (Crypto)' : 'Default Currency (Crypto)'}
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setDefaultCurrency("USDT")}
                                className={`h-14 rounded-xl border-2 transition-all font-semibold text-base flex items-center justify-center gap-2 ${defaultCurrency === "USDT"
                                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-lg"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                                    }`}
                            >
                                <span className="text-lg">₮</span> USDT
                            </button>
                            <button
                                type="button"
                                onClick={() => setDefaultCurrency("USDC")}
                                className={`h-14 rounded-xl border-2 transition-all font-semibold text-base flex items-center justify-center gap-2 ${defaultCurrency === "USDC"
                                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-lg"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                                    }`}
                            >
                                <span className="text-lg">◎</span> USDC
                            </button>
                        </div>

                        {/* 6-month acknowledgment checkbox */}
                        {defaultCurrency && (
                            <div className="flex items-start space-x-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <input
                                    type="checkbox"
                                    id="currencyAck"
                                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                    checked={currencyAcknowledged}
                                    onChange={(e) => setCurrencyAcknowledged(e.target.checked)}
                                />
                                <label htmlFor="currencyAck" className="text-sm text-amber-800 dark:text-amber-200 leading-snug">
                                    {isBR
                                        ? `Estou ciente de que a escolha de ${defaultCurrency} como moeda padrão só poderá ser alterada após 6 meses.`
                                        : `I acknowledge that the choice of ${defaultCurrency} as default currency can only be changed after 6 months.`
                                    }
                                </label>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={async () => { await logout(); router.push("/login"); }}>
                        {isBR ? 'Sair' : 'Logout'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !isFormComplete()}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg shadow-orange-500/20"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isBR ? 'Salvar e Continuar' : 'Save & Continue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
