'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Wallet, ArrowUpRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WithdrawPage() {
    const [balance] = useState(1250.50); // Mock balance
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [network, setNetwork] = useState('POLYGON');
    const [isValidAddress, setIsValidAddress] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (!address) {
            setIsValidAddress(true);
            return;
        }

        let isValid = false;
        if (network === 'POLYGON') {
            isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
        } else if (network === 'TRON') {
            isValid = /^T[a-zA-Z0-9]{33}$/.test(address);
        }
        setIsValidAddress(isValid);
    }, [address, network]);

    const handleWithdraw = () => {
        if (isValidAddress && amount && parseFloat(amount) > 0) {
            setIsConfirmOpen(true);
        }
    };

    const confirmWithdraw = () => {
        // Call API
        setIsConfirmOpen(false);
        alert('Saque solicitado com sucesso!');
    };

    const getFee = () => network === 'POLYGON' ? 0.50 : 3.00;

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="bg-slate-900 text-white rounded-t-xl p-6">
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle className="text-lg font-medium opacity-90">Seu Saldo</CardTitle>
                        <Wallet className="w-5 h-5 opacity-70" />
                    </div>
                    <div className="text-4xl font-bold">
                        {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}
                    </div>
                    <p className="text-sm opacity-70 mt-1">Disponível para saque</p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                    <div className="space-y-2">
                        <Label>Rede de Destino</Label>
                        <RadioGroup defaultValue="POLYGON" onValueChange={setNetwork} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="POLYGON" id="polygon" className="peer sr-only" />
                                <Label
                                    htmlFor="polygon"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer"
                                >
                                    <span className="font-semibold">POLYGON</span>
                                    <span className="text-xs text-muted-foreground mt-1">Taxa: $0.50</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="TRON" id="tron" className="peer sr-only" />
                                <Label
                                    htmlFor="tron"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer"
                                >
                                    <span className="font-semibold">TRON</span>
                                    <span className="text-xs text-muted-foreground mt-1">Taxa: $3.00</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço da Carteira</Label>
                        <div className="relative">
                            <Input
                                id="address"
                                placeholder={network === 'POLYGON' ? '0x...' : 'T...'}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={cn(
                                    !isValidAddress && "border-red-500 focus-visible:ring-red-500"
                                )}
                            />
                            {!isValidAddress && (
                                <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
                            )}
                        </div>
                        {!isValidAddress && (
                            <p className="text-xs text-red-500">Endereço inválido para a rede {network}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor do Saque</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-7"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-lg"
                        onClick={handleWithdraw}
                        disabled={!isValidAddress || !amount || parseFloat(amount) <= 0}
                    >
                        Solicitar Saque
                        <ArrowUpRight className="ml-2 w-5 h-5" />
                    </Button>

                </CardContent>
            </Card>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Saque</DialogTitle>
                        <DialogDescription>
                            Revise os detalhes da transação antes de confirmar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Rede</span>
                            <span className="font-medium">{network}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Endereço</span>
                            <span className="font-medium truncate max-w-[200px]">{address}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Valor</span>
                            <span className="font-medium">$ {parseFloat(amount || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 text-red-500">
                            <span>Taxa de Rede</span>
                            <span>- $ {getFee().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 text-lg font-bold">
                            <span>Total a Receber</span>
                            <span>$ {(parseFloat(amount || '0') - getFee()).toFixed(2)}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmWithdraw}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
