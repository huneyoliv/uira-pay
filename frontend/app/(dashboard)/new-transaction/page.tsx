"use client";

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { getCountryData } from "@/lib/countries";

const translations: any = {
    PT: {
        title: "Nova Transação",
        subtitle: "Gere um QR Code Pix para receber.",
        amountToReceive: "Valor a receber",
        waitingPayment: "Aguardando pagamento...",
        generatingQR: "Gerando QR Code...",
        autoConvert: "O pagamento será convertido automaticamente.",
        cancel: "Cancelar",
        convertingTo: "Convertendo para:",
        generatePix: "Gerar Pix",
        paymentConfirmed: "Pagamento Confirmado!",
        convertedTo: "convertidos para",
        newTransaction: "Nova Transação",
        typeAmount: "Digite o valor no teclado",
    },
    EN: {
        title: "New Transaction",
        subtitle: "Generate a Pix QR Code to receive.",
        amountToReceive: "Amount to receive",
        waitingPayment: "Waiting for payment...",
        generatingQR: "Generating QR Code...",
        autoConvert: "Payment will be automatically converted.",
        cancel: "Cancel",
        convertingTo: "Converting to:",
        generatePix: "Generate Pix",
        paymentConfirmed: "Payment Confirmed!",
        convertedTo: "converted to",
        newTransaction: "New Transaction",
        typeAmount: "Type amount on keyboard",
    },
    FR: {
        title: "Nouvelle Transaction",
        subtitle: "Générez un QR Code Pix pour recevoir.",
        amountToReceive: "Montant à recevoir",
        waitingPayment: "En attente de paiement...",
        generatingQR: "Génération du QR Code...",
        autoConvert: "Le paiement sera converti automatiquement.",
        cancel: "Annuler",
        convertingTo: "Conversion en :",
        generatePix: "Générer Pix",
        paymentConfirmed: "Paiement Confirmé !",
        convertedTo: "convertis en",
        newTransaction: "Nouvelle Transaction",
        typeAmount: "Tapez le montant au clavier",
    },
    ES: {
        title: "Nueva Transacción",
        subtitle: "Genere un código QR Pix para recibir.",
        amountToReceive: "Monto a recibir",
        waitingPayment: "Esperando pago...",
        generatingQR: "Generando código QR...",
        autoConvert: "El pago se convertirá automáticamente.",
        cancel: "Cancelar",
        convertingTo: "Convirtiendo a:",
        generatePix: "Generar Pix",
        paymentConfirmed: "¡Pago Confirmado!",
        convertedTo: "convertidos a",
        newTransaction: "Nueva Transacción",
        typeAmount: "Escribe el monto en el teclado",
    }
};

export default function NewTransactionPage() {
    const [amount, setAmount] = useState('0');
    const [status, setStatus] = useState<'IDLE' | 'WAITING' | 'SUCCESS'>('IDLE');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Determine language
    const countryData = user?.country ? getCountryData(user.country) : { lang: 'PT' };
    const lang = user?.language || countryData.lang || 'PT';
    const localeMap: Record<string, string> = { PT: 'pt-BR', EN: 'en-US', ES: 'es-ES', FR: 'fr-FR' };
    const locale = localeMap[lang as string] || 'pt-BR';
    const t = translations[lang] || translations['EN'];
    const currency = user?.fiatCurrency || 'BRL';

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle key press logic
    const handleKeyPress = useCallback((key: string) => {
        if (status !== 'IDLE') return;

        setAmount((prev) => {
            if (key === 'C' || key === 'Backspace') {
                if (key === 'Backspace') {
                    if (prev.length <= 1) return '0';
                    return prev.slice(0, -1);
                }
                return '0';
            }
            if (prev === '0' && key !== '.') return key;
            if (key === '.' && prev.includes('.')) return prev;
            // Limit decimals
            if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
            // Limit total length to prevent overflow
            if (prev.replace('.', '').length >= 10) return prev;
            return prev + key;
        });
    }, [status]);

    // Keyboard input for desktop
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'IDLE') return;

            // Prevent default for keys we handle
            if (/^[0-9.]$/.test(e.key) || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter') {
                e.preventDefault();
            }

            if (/^[0-9.]$/.test(e.key)) {
                handleKeyPress(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleKeyPress('Backspace');
            } else if (e.key === 'Enter') {
                if (parseFloat(amount) > 0 && !loading) {
                    handleGeneratePix();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, handleKeyPress, amount, loading]);

    // Polling for status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'WAITING' && orderId) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/orders/${orderId}`);
                    if (res.data.status === 'PAID' || res.data.status === 'COMPLETED') {
                        setStatus('SUCCESS');
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Error polling order status", error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [status, orderId]);

    const handleGeneratePix = async () => {
        if (parseFloat(amount) <= 0) return;

        setLoading(true);
        try {
            const res = await api.post('/orders', { amount: parseFloat(amount) });
            setQrCode(res.data.pixCode);
            setOrderId(res.data.id);
            setStatus('WAITING');
        } catch (error) {
            console.error("Error creating order", error);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setAmount('0');
        setStatus('IDLE');
        setQrCode(null);
        setOrderId(null);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    if (status === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
                <div className="bg-black dark:bg-white p-8 rounded-full mb-6 shadow-xl shadow-black/20">
                    <Check className="w-16 h-16 text-white dark:text-black" />
                </div>
                <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">{t.paymentConfirmed}</h1>
                <p className="text-xl text-slate-500 mb-8">
                    {new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(parseFloat(amount))} {t.convertedTo} {user?.default_currency || 'USDT'}
                </p>
                <Button
                    className="rounded-full h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                    onClick={reset}
                >
                    {t.newTransaction}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto pt-4 pb-8 px-4">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
            </div>

            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[32px] p-6 overflow-hidden relative">
                <div className="mb-6 text-center relative z-10">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">{t.amountToReceive}</p>
                    <div className="text-5xl font-bold text-black dark:text-white tracking-tight">
                        {new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(parseFloat(amount))}
                    </div>
                </div>

                {status === 'WAITING' ? (
                    <div className="flex flex-col items-center py-8 relative z-10">
                        {qrCode ? (
                            <div className="bg-white p-4 border-2 border-slate-100 rounded-2xl shadow-sm mb-6">
                                <QRCodeSVG value={qrCode} size={192} />
                            </div>
                        ) : (
                            <div className="w-24 h-24 mb-6 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-black dark:text-white" />
                            </div>
                        )}
                        <p className="text-slate-600 font-medium animate-pulse flex items-center gap-2">
                            {qrCode ? t.waitingPayment : t.generatingQR}
                        </p>
                        {qrCode && (
                            <p className="text-xs text-slate-400 mt-2">{t.autoConvert}</p>
                        )}
                        <Button variant="ghost" onClick={reset} className="mt-4 text-slate-400 hover:text-slate-600">
                            {t.cancel}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-5 relative z-10">
                        <span className="text-sm font-medium text-slate-500">
                            {t.convertingTo} <span className="font-bold text-slate-900 dark:text-white">{user?.default_currency || 'USDT'}</span>
                        </span>

                        {/* Virtual keypad - only on mobile */}
                        {isMobile ? (
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => handleKeyPress(key.toString())}
                                        className={cn(
                                            "h-14 text-xl font-bold rounded-2xl transition-all active:scale-95 duration-200",
                                            key === 'C'
                                                ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                        )}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-slate-400 dark:text-slate-500 animate-pulse">
                                    ⌨️ {t.typeAmount}
                                </p>
                            </div>
                        )}

                        <Button
                            className="w-full h-14 text-lg rounded-full bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white shadow-lg shadow-black/20 font-bold transition-all"
                            onClick={handleGeneratePix}
                            disabled={parseFloat(amount) <= 0 || loading}
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    {t.generatePix}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
