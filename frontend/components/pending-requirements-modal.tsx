"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export function PendingRequirementsModal() {
    const { user, login, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currency, setCurrency] = useState("");
    const [docNumber, setDocNumber] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        const missingCurrency = !user.default_currency;
        const missingDoc = !user.doc_number;

        if (missingCurrency || missingDoc) {
            setOpen(true);
            if (user.default_currency) setCurrency(user.default_currency);
            if (user.doc_number) setDocNumber(user.doc_number);
        }
    }, [user]);

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        try {
            await api.patch("/me/config", {
                defaultCurrency: currency,
                docNumber: docNumber || undefined,
            });

            // Update local user
            if (user) {
                const updatedUser = {
                    ...user,
                    default_currency: currency,
                    doc_number: docNumber || user.doc_number,
                };

                const token = localStorage.getItem("auth-token");
                if (token) {
                    login(token, updatedUser);
                }
            }
            setOpen(false);
        } catch (err: any) {
            if (err.response?.status === 401) {
                logout();
                router.push("/login");
                return;
            }
            setError(err.response?.data?.message || "Erro ao salvar configurações.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        // Force open if requirements are pending
        if (!newOpen) {
            const missingCurrency = !user?.default_currency;
            const missingDoc = !user?.doc_number;
            if (missingCurrency || missingDoc) return;
        }
        setOpen(newOpen);
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] bg-white" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        Ação Necessária
                    </DialogTitle>
                    <DialogDescription>
                        Para continuar acessando o painel, por favor complete as informações pendentes.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!user?.default_currency && (
                        <div className="space-y-2">
                            <Label htmlFor="currency">Moeda Padrão</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a moeda" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USDT">USDT</SelectItem>
                                    <SelectItem value="USDC">USDC</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                Atenção: Esta escolha só poderá ser alterada após 6 meses.
                            </p>
                        </div>
                    )}

                    {!user?.doc_number && (
                        <div className="space-y-2">
                            <Label htmlFor="docNumber">CPF/CNPJ</Label>
                            <Input
                                id="docNumber"
                                value={docNumber}
                                onChange={(e) => setDocNumber(e.target.value)}
                                placeholder="Digite seu documento"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={() => { logout(); router.push("/login"); }}>
                        Sair
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (!user?.default_currency && !currency) || (!user?.doc_number && !docNumber)}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar e Continuar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
