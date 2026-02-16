"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { FileText, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export function NewTermsBanner() {
    const { user } = useAuthStore();
    const [termsData, setTermsData] = useState<any>(null);
    const [content, setContent] = useState<string>("");
    const [showContent, setShowContent] = useState(false);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        if (!user) return;
        checkNewTerms();
    }, [user]);

    const checkNewTerms = async () => {
        try {
            const res = await api.get("/tenant/terms/check");
            if (res.data.hasNewTerms || res.data.hasNewPrivacy) {
                setTermsData(res.data);
            }
        } catch {
            // No terms endpoint or no new terms
        }
    };

    const handleViewTerms = async () => {
        try {
            const lang = user?.language?.toUpperCase() || "PT";
            const langMap: Record<string, string> = { PT: "pt", EN: "en", ES: "es", FR: "fr" };
            const res = await api.get(`/tenant/terms/current?type=terms&lang=${langMap[lang] || "pt"}`);
            setContent(res.data.content || "No content available.");
            setShowContent(true);
        } catch {
            setContent("Unable to load terms.");
            setShowContent(true);
        }
    };

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await api.post("/tenant/terms/accept");
            setTermsData(null);
            setShowContent(false);
        } catch (err) {
            console.error("Failed to accept terms:", err);
        } finally {
            setAccepting(false);
        }
    };

    if (!termsData) return null;

    return (
        <>
            {/* Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            {termsData.hasNewTerms ? "New Terms of Use" : "New Privacy Policy"}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Please review and accept the updated terms to continue using the platform.
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={handleViewTerms}>
                            <FileText className="h-3 w-3 mr-1" />
                            View
                        </Button>
                        <Button size="sm" className="rounded-xl text-xs" onClick={handleAccept} disabled={accepting}>
                            {accepting ? "..." : "Accept"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal to view full terms */}
            {showContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0B0F19] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold">Terms of Use</h2>
                            <button onClick={() => setShowContent(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        import ReactMarkdown from 'react-markdown';

                        // ... inside component ...

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="prose dark:prose-invert text-sm max-w-none">
                                <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <Button variant="outline" className="rounded-xl" onClick={() => setShowContent(false)}>
                                Close
                            </Button>
                            <Button className="rounded-xl" onClick={handleAccept} disabled={accepting}>
                                {accepting ? "Accepting..." : "I Accept"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
