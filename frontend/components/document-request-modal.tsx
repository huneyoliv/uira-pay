"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Loader2, FileUp, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentRequestModal() {
    const { user, login, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (user?.documentRequested) {
            setOpen(true);
        }
    }, [user]);

    const handleUpload = async () => {
        if (!file) return;
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("document", file);

            await api.post("/upload/document", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Update local user state
            if (user) {
                login(null, { ...user, documentRequested: false });
            }
            setOpen(false);
        } catch (err: any) {
            if (err.response?.status === 401) {
                await logout();
                router.push("/login");
                return;
            }
            setError(err.response?.data?.message || "Failed to upload document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        // Force open if document is requested
        if (!newOpen && user?.documentRequested) return;
        setOpen(newOpen);
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] bg-white dark:bg-slate-900" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        Document Required
                    </DialogTitle>
                    <DialogDescription>
                        The administration has requested you to upload a document to continue using the platform.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {(user as any)?.documentRequestMsg && (
                        <div className="text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-amber-800 dark:text-amber-200">
                            <strong>Message:</strong> {(user as any).documentRequestMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label
                            htmlFor="document-upload"
                            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <FileUp className="h-8 w-8 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">
                                {file ? file.name : "Click to select a file"}
                            </span>
                            <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (max 10MB)</span>
                            <input
                                id="document-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={async () => { await logout(); router.push("/login"); }}>
                        Logout
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={loading || !file}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload & Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
