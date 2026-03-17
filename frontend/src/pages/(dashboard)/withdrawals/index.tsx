"use client";


import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { getCountryData } from "@/lib/countries";
import { Wallet, ArrowRight, AlertCircle, CheckCircle, ArrowLeft, Trash2, Save, Shield } from "lucide-react";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

// ... translations ...
const translations: any = {
    PT: {
        title: "Saques",
        subtitle: "Gerencie seus saques.",
        availableBalance: "Saldo Disponível",
        network: "Rede",
        selectNetwork: "Selecione a rede",
        address: "Endereço da Carteira",
        amount: "Valor do Saque",
        fee: "Taxa de Rede",
        youReceive: "Você Recebe",
        withdraw: "Solicitar Saque",
        confirm: "Confirmar Saque",
        success: "Solicitação de saque enviada com sucesso! Aguarde o processamento.",
        error: "Erro ao solicitar saque.",
        insufficientBalance: "Saldo insuficiente.",
        minAmount: "O valor mínimo para saque é 10 USDT/USDC.",
        processing: "Processando...",
        binanceZeroFee: "Taxa zero para clientes Binance",
        viewTransaction: "Ver Transação",
        binanceOption: "Binance",
        otherOption: "Blockchain",
        otherDesc: "BSC, Polygon, etc.",
        email: "E-mail da Conta Binance",
        back: "Voltar",
        saveWallet: "Salvar carteira para futuro",
        nickname: "Apelido da Carteira",
        savedWallets: "Carteiras Salvas",
        selectSaved: "Selecionar carteira salva...",
        zeroFee: "Taxa Zero",
    },
    EN: {
        title: "Withdrawals",
        subtitle: "Manage your withdrawals.",
        availableBalance: "Available Balance",
        network: "Network",
        selectNetwork: "Select network",
        address: "Wallet Address",
        amount: "Withdrawal Amount",
        fee: "Network Fee",
        youReceive: "You Receive",
        withdraw: "Request Withdrawal",
        confirm: "Confirm Withdrawal",
        success: "Withdrawal request sent successfully! Please wait for processing.",
        error: "Error requesting withdrawal.",
        insufficientBalance: "Insufficient balance.",
        minAmount: "Minimum amount not reached.",
        processing: "Processing...",
        binanceZeroFee: "Zero fees for Binance users",
        viewTransaction: "View Transaction",
        binanceOption: "Binance",
        otherOption: "Blockchain",
        otherDesc: "BSC, Polygon, etc.",
        email: "Binance Account Email",
        back: "Back",
        saveWallet: "Save wallet for future",
        nickname: "Wallet Nickname",
        savedWallets: "Saved Wallets",
        selectSaved: "Select saved wallet...",
        zeroFee: "Zero Fee",
    },
    FR: {
        title: "Retraits",
        subtitle: "Gérez vos retraits.",
        availableBalance: "Solde Disponible",
        network: "Réseau",
        selectNetwork: "Sélectionner le réseau",
        address: "Adresse du Portefeuille",
        amount: "Montant du Retrait",
        fee: "Frais de Réseau",
        youReceive: "Vous Recevez",
        withdraw: "Demander un Retrait",
        confirm: "Confirmer le Retrait",
        success: "Demande de retrait envoyée avec succès ! Veuillez attendre le traitement.",
        error: "Erreur lors de la demande de retrait.",
        insufficientBalance: "Solde insuffisant.",
        minAmount: "Le montant minimum de retrait est de 10 USDT/USDC.",
        processing: "Traitement...",
        binanceZeroFee: "Zéro frais pour clients Binance",
        viewTransaction: "Voir la Transaction",
        binanceOption: "Binance",
        otherOption: "Blockchain",
        otherDesc: "BSC, Polygon, etc.",
        email: "E-mail du Compte Binance",
        back: "Retour",
        saveWallet: "Enregistrer le portefeuille",
        nickname: "Surnom du portefeuille",
        savedWallets: "Portefeuilles Enregistrés",
        selectSaved: "Sélectionner un portefeuille...",
        zeroFee: "Zéro Frais",
    },
    ES: {
        title: "Retiros",
        subtitle: "Administre sus retiros.",
        availableBalance: "Saldo Disponible",
        network: "Red",
        selectNetwork: "Seleccionar red",
        address: "Dirección de Billetera",
        amount: "Monto del Retiro",
        fee: "Tarifa de Red",
        youReceive: "Usted Recibe",
        withdraw: "Solicitar Retiro",
        confirm: "Confirmar Retiro",
        success: "¡Solicitud de retiro enviada con éxito! Espere el procesamiento.",
        error: "Error al solicitar el retiro.",
        insufficientBalance: "Saldo insuficiente.",
        minAmount: "El monto mínimo de retiro es 10 USDT/USDC.",
        processing: "Procesando...",
        binanceZeroFee: "Cero tarifas para clientes Binance",
        viewTransaction: "Ver Transacción",
        binanceOption: "Binance",
        otherOption: "Blockchain",
        otherDesc: "BSC, Polygon, etc.",
        email: "Email de Cuenta Binance",
        back: "Volver",
        saveWallet: "Guardar billetera",
        nickname: "Apodo de la Billetera",
        savedWallets: "Billeteras Guardadas",
        selectSaved: "Seleccionar billetera guardada...",
        zeroFee: "Cero Tarifas",
    }
};

interface NetworkFee {
    network: string;
    fee: number;
    currency: string;
    displayName: string;
}

interface SavedWallet {
    id: string;
    address: string;
    network: string;
    nickname: string;
}

export function WithdrawalsPage() {
    const user = useAuthStore((state) => state.user);
    const countryData = user?.country ? getCountryData(user.country) : { lang: 'PT' };
    const lang = user?.language || countryData.lang || 'PT';
    const t = translations[lang] || translations['EN'];
    const currency = user?.default_currency || 'USDT';

    const [view, setView] = useState<'main' | 'binance' | 'other'>('main');
    const [networks, setNetworks] = useState<NetworkFee[]>([]);
    const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);

    // Form States
    const [selectedNetwork, setSelectedNetwork] = useState<string>("");
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [saveWallet, setSaveWallet] = useState(false);
    const [nickname, setNickname] = useState("");

    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [needs2FA, setNeeds2FA] = useState(false);

    useEffect(() => {
        fetchData();
        fetchSavedWallets();
    }, []);

    const fetchData = async () => {
        try {
            const [feesRes, metricsRes] = await Promise.all([
                api.get("/withdrawals/fees"),
                api.get("/tenant/dashboard/metrics")
            ]);
            setNetworks(feesRes.data);
            setBalance(metricsRes.data.balance || 0);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    const fetchSavedWallets = async () => {
        try {
            const res = await api.get("/wallets/saved");
            setSavedWallets(res.data);
        } catch (err) {
            console.error("Error fetching saved wallets", err);
        }
    }

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const isBinance = view === 'binance';
            const network = isBinance ? 'BINANCE_INTERNAL' : selectedNetwork;
            const currentFee = isBinance ? 0 : (networks.find(n => n.network === network)?.fee || 0);
            const amountNum = parseFloat(amount);

            if (amountNum <= 0) {
                throw new Error("Invalid amount");
            }

            if (amountNum + currentFee > balance) {
                throw new Error(t.insufficientBalance);
            }

            const res = await api.post("/withdrawals/request", {
                amount: amountNum,
                network: network,
                address: address,
                save_wallet: !isBinance && saveWallet,
                nickname: !isBinance && saveWallet ? nickname : undefined,
                totpCode: totpCode || undefined,
            });

            // Backend returns requiresTwoFactor if 2FA is needed but no code sent
            if (res.data?.requiresTwoFactor) {
                setNeeds2FA(true);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setAmount("");
            if (saveWallet) fetchSavedWallets(); // Refresh list if saved
            // Don't clear address immediately so user can see what they sent, or do clear?
            // setAddress(""); 
            fetchData(); // Refresh balance
        } catch (err: any) {
            console.error("Withdrawal error:", err);
            setError(err.response?.data?.message || t.error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSaved = (walletId: string) => {
        const wallet = savedWallets.find(w => w.id === walletId);
        if (wallet) {
            setSelectedNetwork(wallet.network);
            setAddress(wallet.address);
        }
    }

    const currentFee = view === 'binance' ? 0 : (networks.find(n => n.network === selectedNetwork)?.fee || 0);
    const totalDeduction = (parseFloat(amount) || 0) + currentFee;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                {view !== 'main' && (
                    <Button variant="ghost" size="icon" onClick={() => setView('main')}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Balance Card */}
                <Card className="bg-black dark:bg-slate-800 text-white border-none shadow-xl shadow-black/20 dark:shadow-slate-900/50 rounded-[24px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-black/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <CardContent className="p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <div>
                            <p className="text-slate-300 dark:text-slate-400 text-sm font-medium mb-1">{t.availableBalance}</p>
                            <div className="text-3xl font-bold">
                                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balance)} <span className="text-lg opacity-80">{currency}</span>
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                    </CardContent>
                </Card>

                {/* Main View: Selection */}
                {view === 'main' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 dark:border-slate-700 hover:border-[#F0B90B] hover:bg-[#F0B90B]/5 transition-all group rounded-[20px] dark:bg-slate-900 overflow-hidden"
                            onClick={() => setView('binance')}
                        >
                            <div className="h-10 w-10 rounded-full bg-[#F0B90B]/10 flex items-center justify-center">
                                <img
                                    src="/binance-logo.svg"
                                    alt="Binance Logo"
                                    className="h-5 w-5"
                                />
                            </div>
                            <div className="text-center w-full overflow-hidden">
                                <span className="block text-base font-bold text-slate-800 dark:text-white">{t.binanceOption}</span>
                                <span className="block text-xs text-slate-500 truncate">{t.binanceZeroFee}</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group rounded-[20px] dark:bg-slate-900 overflow-hidden"
                            onClick={() => setView('other')}
                        >
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-center w-full overflow-hidden">
                                <span className="block text-base font-bold text-slate-800 dark:text-white">{t.otherOption}</span>
                                <span className="block text-xs text-slate-500 truncate">{t.otherDesc}</span>
                            </div>
                        </Button>
                    </div>
                )}

                {/* Specific Views */}
                {view !== 'main' && (
                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[24px]">
                        <CardHeader>
                            <CardTitle>{view === 'binance' ? t.binanceOption : t.otherOption}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleWithdraw} className="space-y-6">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {success && (
                                    <Alert className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertTitle>Success</AlertTitle>
                                        <AlertDescription>{t.success}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Other View: Saved Wallet Selection */}
                                {view === 'other' && savedWallets.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>{t.selectSaved}</Label>
                                        <Select onValueChange={handleSelectSaved}>
                                            <SelectTrigger className="rounded-xl h-12">
                                                <SelectValue placeholder={t.selectSaved} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {savedWallets.map((w) => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        {w.nickname || w.address} ({w.network})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Other View: Network Selection */}
                                {view === 'other' && (
                                    <div className="space-y-2">
                                        <Label>{t.network}</Label>
                                        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                                            <SelectTrigger className="rounded-xl h-12">
                                                <SelectValue placeholder={t.selectNetwork} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {networks.map((net) => (
                                                    <SelectItem key={net.network} value={net.network}>
                                                        {net.displayName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className={view === 'other' && !selectedNetwork ? 'text-slate-400' : ''}>{view === 'binance' ? t.email : t.address}</Label>
                                    <Input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder={view === 'binance' ? "user@example.com" : "0x..."}
                                        className="rounded-xl h-12"
                                        disabled={view === 'other' && !selectedNetwork}
                                    />
                                </div>

                                {/* Amount Input */}
                                <div className="space-y-2">
                                    <Label>{t.amount}</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="rounded-xl h-12 pr-16"
                                            step="0.01"
                                            min="0"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                            {currency}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 px-1">
                                        <span>Min: 10 {currency}</span>
                                        <span>{t.fee}: {currentFee === 0 ? t.zeroFee : `${currentFee} ${currency}`}</span>
                                        <span>Total: {totalDeduction.toFixed(2)} {currency}</span>
                                    </div>
                                </div>

                                {/* Save Wallet Checkbox (Only Other) */}
                                {view === 'other' && (
                                    <div className="flex items-center space-x-2">
                                        <Switch id="save-wallet" checked={saveWallet} onCheckedChange={setSaveWallet} />
                                        <Label htmlFor="save-wallet">{t.saveWallet}</Label>
                                    </div>
                                )}

                                {/* Nickname Input (Only if Save Checked) */}
                                {view === 'other' && saveWallet && (
                                    <div className="space-y-2">
                                        <Label>{t.nickname}</Label>
                                        <Input
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="My Wallet"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                )}

                                {/* 2FA Code Input — shown when user has 2FA enabled */}
                                {needs2FA && (
                                    <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-medium">
                                            <Shield className="h-4 w-4" />
                                            <span>2FA Required</span>
                                        </div>
                                        <Input
                                            value={totpCode}
                                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="font-mono text-center text-lg tracking-[0.5em] rounded-xl h-12"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-1/3 h-12 rounded-xl"
                                        onClick={() => setView('main')}
                                    >
                                        {t.back}
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-2/3 h-12 rounded-xl bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white font-bold text-base shadow-lg shadow-black/20"
                                        disabled={loading || (!selectedNetwork && view === 'other') || !address || !amount || parseFloat(amount) < 10 || totalDeduction > balance}
                                    >
                                        {loading ? t.processing : t.confirm}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
