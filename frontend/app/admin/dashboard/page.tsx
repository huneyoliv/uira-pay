"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Wallet, RefreshCw, Zap, Users, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import axios from "axios"

export default function AdminDashboard() {
    const [binanceBalances, setBinanceBalances] = useState<any>(null)
    const [tenantLiabilities, setTenantLiabilities] = useState<any>(null)
    const [stats, setStats] = useState({ pendingApprovals: 0, activeTenants: 0 })
    const [loading, setLoading] = useState(true)
    const [pixCode, setPixCode] = useState("")
    const [replenishLoading, setReplenishLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            // Hardcoded admin key for demo purposes
            const headers = { "x-admin-key": "admin-secret-123" }
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            const authHeaders = { Authorization: `Bearer ${token}` }

            const [binanceRes, tenantsRes, statsRes] = await Promise.allSettled([
                api.get("/admin/balances/binance", { headers }),
                api.get("/admin/balances/tenants", { headers }),
                axios.get("https://api.swaptune.me/admin/stats", { headers: authHeaders })
            ])

            if (binanceRes.status === 'fulfilled') setBinanceBalances(binanceRes.value.data)
            if (tenantsRes.status === 'fulfilled') setTenantLiabilities(tenantsRes.value.data)
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)

        } catch (error) {
            console.error("Failed to fetch admin data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const handleReplenish = async () => {
        if (!pixCode) return
        setReplenishLoading(true)
        try {
            await api.post("/admin/liquidity/pay-invoice", {
                pixCode,
                description: "Manual Replenishment via Dashboard"
            }, {
                headers: { "x-admin-key": "admin-secret-123" }
            })
            alert("Liquidez reabastecida com sucesso!")
            setPixCode("")
            fetchData() // Refresh balances
        } catch (error) {
            console.error("Replenish failed", error)
            alert("Falha ao reabastecer liquidez.")
        } finally {
            setReplenishLoading(false)
        }
    }

    if (loading && !binanceBalances && !stats) {
        return <div className="p-8 text-center">Carregando Dashboard...</div>
    }

    // Calculations
    const totalUsdtAssets = binanceBalances?.USDT || 0
    const totalUsdtLiabilities = tenantLiabilities?.USDT || 0
    const solvencyRatio = totalUsdtLiabilities > 0 ? (totalUsdtAssets / totalUsdtLiabilities) * 100 : 100
    const isInsolvent = totalUsdtAssets < totalUsdtLiabilities

    // Gas Levels
    const trxLevel = binanceBalances?.TRX || 0
    const maticLevel = binanceBalances?.MATIC || 0
    const trxLow = trxLevel < 50
    const maticLow = maticLevel < 1

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard de Tesouraria</h2>
                <Button onClick={fetchData} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                </Button>
            </div>

            {/* Solvency Alert */}
            {isInsolvent && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6" />
                    <div>
                        <p className="font-bold">ALERTA DE INSOLVÊNCIA</p>
                        <p>O passivo dos clientes excede o saldo em caixa. Rebalanceamento necessário imediato.</p>
                    </div>
                </div>
            )}

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                        <p className="text-xs text-muted-foreground">
                            Empresas aguardando análise
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeTenants}</div>
                        <p className="text-xs text-muted-foreground">
                            Total de empresas aprovadas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Binance (Caixa)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsdtAssets.toFixed(2)} USDT</div>
                        <p className="text-xs text-muted-foreground">
                            + {binanceBalances?.BRL?.toFixed(2)} BRL | {binanceBalances?.USDC?.toFixed(2)} USDC
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Passivo Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsdtLiabilities.toFixed(2)} USDT</div>
                        <p className="text-xs text-muted-foreground">
                            Soma de todas as carteiras
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status de Solvência</CardTitle>
                        {isInsolvent ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isInsolvent ? "text-red-500" : "text-green-500"}`}>
                            {solvencyRatio.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cobertura de ativos sobre passivos
                        </p>
                    </CardContent>
                </Card>

                {/* Gas Monitor */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Monitor de Gás
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1 text-sm">
                                <span>TRX (Tron)</span>
                                <span className={trxLow ? "text-red-500 font-bold" : ""}>{trxLevel.toFixed(2)}</span>
                            </div>
                            <Progress value={Math.min(trxLevel, 100)} className={trxLow ? "bg-red-100" : ""} indicatorClassName={trxLow ? "bg-red-500" : "bg-blue-500"} />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1 text-sm">
                                <span>MATIC</span>
                                <span className={maticLow ? "text-red-500 font-bold" : ""}>{maticLevel.toFixed(2)}</span>
                            </div>
                            <Progress value={Math.min(maticLevel * 10, 100)} className={maticLow ? "bg-red-100" : ""} indicatorClassName={maticLow ? "bg-red-500" : "bg-purple-500"} />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Ações de Liquidez</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                                    Reabastecer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Reabastecer Liquidez</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Cole o código "Pix Copia e Cola" gerado na Binance para depositar BRL.
                                    </p>
                                    <Input
                                        placeholder="Cole o código Pix aqui..."
                                        value={pixCode}
                                        onChange={(e) => setPixCode(e.target.value)}
                                    />
                                    <Button
                                        className="w-full"
                                        onClick={handleReplenish}
                                        disabled={!pixCode || replenishLoading}
                                    >
                                        {replenishLoading ? "Processando..." : "Pagar Pix"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
