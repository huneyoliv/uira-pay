import { api } from './api';

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export async function getSignedUrl(filename: string): Promise<string> {
    if (!filename) return '';

    const cached = signedUrlCache.get(filename);
    if (cached && cached.expiresAt > Date.now() + 60000) {
        return cached.url;
    }

    try {
        const res = await api.get(`/upload/signed-url/${filename}`);
        const { signedUrl, expiresAt } = res.data;

        signedUrlCache.set(filename, { url: signedUrl, expiresAt });
        return signedUrl;
    } catch (error) {
        console.error('Failed to get signed URL:', error);
        return '';
    }
}

export function extractFilenameFromUrl(url: string): string {
    if (!url) return '';

    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const parts = pathname.split('/');
        return parts[parts.length - 1];
    } catch {
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0];
    }
}
