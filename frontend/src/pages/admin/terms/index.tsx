"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { Save, FileText, Clock, Loader2 } from "lucide-react";

export function AdminTermsPage() {
    const [type, setType] = useState<"terms" | "privacy">("terms");
    const [contentPt, setContentPt] = useState("");
    const [contentEn, setContentEn] = useState("");
    const [contentEs, setContentEs] = useState("");
    const [contentFr, setContentFr] = useState("");
    const [effectiveAt, setEffectiveAt] = useState("");
    const [notifyUsers, setNotifyUsers] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchHistory();
        fetchLatest();
    }, [type]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/admin/terms?type=${type}`);
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load terms history:", err);
        }
    };

    const fetchLatest = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/terms/latest/${type}`);
            setContentPt(res.data.content_pt || "");
            setContentEn(res.data.content_en || "");
            setContentEs(res.data.content_es || "");
            setContentFr(res.data.content_fr || "");
        } catch {
            // No existing document — blank
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!effectiveAt) {
            alert("Please set an effective date (minimum 15 days from now)");
            return;
        }
        setSaving(true);
        setSuccess("");
        try {
            await api.post("/admin/terms", {
                type,
                content_pt: contentPt,
                content_en: contentEn,
                content_es: contentEs,
                content_fr: contentFr,
                effectiveAt,
                notifyUsers,
            });
            setSuccess("Document saved and users notified!");
            fetchHistory();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 15);
    const minDateStr = minDate.toISOString().split("T")[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Legal Documents</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage terms of use and privacy policy</p>
            </div>

            {/* Type selector */}
            <div className="flex gap-2">
                <Button
                    variant={type === "terms" ? "default" : "outline"}
                    onClick={() => setType("terms")}
                    className="rounded-xl"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Terms of Use
                </Button>
                <Button
                    variant={type === "privacy" ? "default" : "outline"}
                    onClick={() => setType("privacy")}
                    className="rounded-xl"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy Policy
                </Button>
            </div>

            {/* Editor */}
            <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg">{type === "terms" ? "Terms of Use" : "Privacy Policy"} — Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Português</label>
                                    </div>
                                    <Tabs defaultValue="edit" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 h-8">
                                            <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                                            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="edit">
                                            <textarea
                                                value={contentPt}
                                                onChange={(e) => setContentPt(e.target.value)}
                                                rows={10}
                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-y focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none font-mono"
                                                placeholder="# Termos de Uso..."
                                            />
                                        </TabsContent>
                                        <TabsContent value="preview" className="border rounded-xl p-4 min-h-[220px] bg-white dark:bg-slate-800/50 overflow-y-auto max-h-[400px]">
                                            <div className="prose dark:prose-invert text-sm max-w-none">
                                                <ReactMarkdown>{contentPt || "*No content*"}</ReactMarkdown>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">English</label>
                                    </div>
                                    <Tabs defaultValue="edit" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 h-8">
                                            <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                                            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="edit">
                                            <textarea
                                                value={contentEn}
                                                onChange={(e) => setContentEn(e.target.value)}
                                                rows={10}
                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-y focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none font-mono"
                                                placeholder="# Terms of Service..."
                                            />
                                        </TabsContent>
                                        <TabsContent value="preview" className="border rounded-xl p-4 min-h-[220px] bg-white dark:bg-slate-800/50 overflow-y-auto max-h-[400px]">
                                            <div className="prose dark:prose-invert text-sm max-w-none">
                                                <ReactMarkdown>{contentEn || "*No content*"}</ReactMarkdown>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Español</label>
                                    </div>
                                    <Tabs defaultValue="edit" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 h-8">
                                            <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                                            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="edit">
                                            <textarea
                                                value={contentEs}
                                                onChange={(e) => setContentEs(e.target.value)}
                                                rows={10}
                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-y focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none font-mono"
                                                placeholder="# Términos de Uso..."
                                            />
                                        </TabsContent>
                                        <TabsContent value="preview" className="border rounded-xl p-4 min-h-[220px] bg-white dark:bg-slate-800/50 overflow-y-auto max-h-[400px]">
                                            <div className="prose dark:prose-invert text-sm max-w-none">
                                                <ReactMarkdown>{contentEs || "*No content*"}</ReactMarkdown>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Français</label>
                                    </div>
                                    <Tabs defaultValue="edit" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 h-8">
                                            <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                                            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="edit">
                                            <textarea
                                                value={contentFr}
                                                onChange={(e) => setContentFr(e.target.value)}
                                                rows={10}
                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-y focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none font-mono"
                                                placeholder="# Conditions d'Utilisation..."
                                            />
                                        </TabsContent>
                                        <TabsContent value="preview" className="border rounded-xl p-4 min-h-[220px] bg-white dark:bg-slate-800/50 overflow-y-auto max-h-[400px]">
                                            <div className="prose dark:prose-invert text-sm max-w-none">
                                                <ReactMarkdown>{contentFr || "*No content*"}</ReactMarkdown>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Effective Date</label>
                                    <Input
                                        type="date"
                                        value={effectiveAt}
                                        onChange={(e) => setEffectiveAt(e.target.value)}
                                        min={minDateStr}
                                        className="w-48 rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    <p className="text-xs text-slate-400">Minimum 15 days from now</p>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifyUsers}
                                        onChange={(e) => setNotifyUsers(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Notify all users by email</span>
                                </label>

                                <Button onClick={handleSave} disabled={saving} className="rounded-xl ml-auto">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save & Publish
                                </Button>
                            </div>

                            {success && (
                                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                                    ✓ {success}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
                <Card className="bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Version History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {history.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Saved: {new Date(doc.savedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Effective: {new Date(doc.effectiveAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${new Date(doc.effectiveAt) <= new Date()
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {new Date(doc.effectiveAt) <= new Date() ? 'Active' : 'Scheduled'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
