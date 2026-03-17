"use client";

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, DollarSign } from "lucide-react";

export function OnboardingPage() {
    const navigate = useNavigate();
    const { user, token } = useAuthStore();
    const [currency, setCurrency] = useState<"USDT" | "USDC">("USDT");
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingConfig, setCheckingConfig] = useState(true);

    useEffect(() => {
        const checkConfig = async () => {
            try {
                const res = await api.get("/me/balance"); // Using balance endpoint to check config implicitly or we could fetch tenant details
                // Ideally we should have a /me endpoint that returns full tenant info including config lock status
                // For now, assuming if we can't get balance or if we get it, we check lock status if available in store or fetch it.
                // Let's try to fetch tenant info if endpoint exists, otherwise proceed.
                // Based on previous steps, we have PATCH /me/config but maybe not GET /me/config.
                // Let's assume we proceed and if PATCH fails with 403 (Locked), we redirect.
                setCheckingConfig(false);
            } catch (error) {
                console.error("Error checking config", error);
                setCheckingConfig(false);
            }
        };
        checkConfig();
    }, []);

    const handleSubmit = async () => {
        if (!confirmed) return;
        setLoading(true);
        try {
            await api.patch("/me/config", { defaultCurrency: currency });
            navigate("/dashboard");
        } catch (error: any) {
            if (error.response?.status === 403) {
                // Already locked, redirect
                navigate("/dashboard");
            } else {
                alert("Erro ao salvar configuração. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (checkingConfig) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Configuração Inicial</CardTitle>
                    <CardDescription className="text-center text-lg mt-2">
                        Escolha sua moeda padrão para operações.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <RadioGroup defaultValue="USDT" onValueChange={(v) => setCurrency(v as "USDT" | "USDC")} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="USDT" id="usdt" className="peer sr-only" />
                            <Label
                                htmlFor="usdt"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 dark:peer-data-[state=checked]:bg-green-950 cursor-pointer transition-all"
                            >
                                <DollarSign className="mb-3 h-10 w-10 text-green-600" />
                                <span className="text-xl font-bold">USDT (Tether)</span>
                                <span className="text-sm text-muted-foreground mt-1">Maior Liquidez</span>
                                <CheckCircle2 className="mt-3 h-6 w-6 opacity-0 peer-data-[state=checked]:opacity-100 text-green-600" />
                            </Label>
                        </div>

                        <div>
                            <RadioGroupItem value="USDC" id="usdc" className="peer sr-only" />
                            <Label
                                htmlFor="usdc"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950 cursor-pointer transition-all"
                            >
                                <DollarSign className="mb-3 h-10 w-10 text-blue-600" />
                                <span className="text-xl font-bold">USDC (Circle)</span>
                                <span className="text-sm text-muted-foreground mt-1">Regulado & Seguro</span>
                                <CheckCircle2 className="mt-3 h-6 w-6 opacity-0 peer-data-[state=checked]:opacity-100 text-blue-600" />
                            </Label>
                        </div>
                    </RadioGroup>

                    <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:bg-red-900/20 dark:border-red-900">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="space-y-2">
                                <h4 className="font-medium text-red-900 dark:text-red-200">Atenção: Escolha Irreversível</h4>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="confirm"
                                        checked={confirmed}
                                        onCheckedChange={(c) => setConfirmed(c as boolean)}
                                        className="border-red-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                    />
                                    <label
                                        htmlFor="confirm"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-800 dark:text-red-300"
                                    >
                                        Estou ciente que esta escolha é irreversível pelos próximos 6 meses.
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full text-lg h-12"
                        onClick={handleSubmit}
                        disabled={!confirmed || loading}
                    >
                        {loading ? "Salvando..." : "Confirmar Setup"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
