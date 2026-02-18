import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : (process.env.NEXT_PUBLIC_DOMAIN ? `https://api.${process.env.NEXT_PUBLIC_DOMAIN}` : 'https://api.swaptune.me');



export const api = axios.create({
    baseURL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        // NEVER redirect on auth endpoints — the logout/login flows handle their own redirects
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/logout');

        if (error.response?.status === 401 && !isAuthEndpoint) {
            // Check if a logout is already in progress — avoid competing redirect
            const authStorage = localStorage.getItem('auth-storage');
            let logoutInProgress = false;
            try {
                const parsed = JSON.parse(authStorage || '{}');
                logoutInProgress = parsed?.state?._logoutInProgress === true;
            } catch { /* ignore parse errors */ }

            if (!logoutInProgress) {
                localStorage.removeItem('auth-token');
                localStorage.removeItem('auth-storage');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);
