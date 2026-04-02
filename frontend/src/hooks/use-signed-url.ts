import { useState, useEffect } from 'react';
import { getSignedUrl, extractFilenameFromUrl } from '@/lib/signed-url';

export function useSignedUrl(url: string | null | undefined): string {
    const [signedUrl, setSignedUrl] = useState<string>('');

    useEffect(() => {
        if (!url) {
            setSignedUrl('');
            return;
        }

        // If URL already has token params, use it directly
        if (url.includes('token=') && url.includes('expires=')) {
            setSignedUrl(url);
            return;
        }

        // Extract filename and get signed URL
        const filename = extractFilenameFromUrl(url);
        if (!filename) {
            setSignedUrl('');
            return;
        }

        let cancelled = false;

        getSignedUrl(filename).then((signed) => {
            if (!cancelled) {
                setSignedUrl(signed);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return signedUrl;
}
