import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    doc_number: string;
    default_currency: string | null;
    preference_locked_until: string | Date;
    fiatCurrency?: string;
    country?: string;
    language?: string;
    theme?: string;
    profilePhotoUrl?: string | null;
    twoFactorEnabled?: boolean;
    isAdmin?: boolean;
    status: string;
    documentRequested?: boolean;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    _logoutInProgress: boolean;
    login: (token: string | null, user: User) => void;
    logout: () => Promise<void>;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,
            _logoutInProgress: false,
            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },
            login: (token, user) => {
                if (token) {
                    localStorage.setItem('auth-token', token);
                }
                set({ token, user, isAuthenticated: true });
            },
            logout: async () => {
                // Guard: prevent double logout
                if (get()._logoutInProgress) return;
                set({ _logoutInProgress: true });

                // Clear all auth state FIRST to ensure redirect always works
                localStorage.removeItem('auth-token');
                localStorage.removeItem('auth-storage');
                set({ token: null, user: null, isAuthenticated: false, _logoutInProgress: false });

                // AWAIT the API call so the server's Set-Cookie header clears the HttpOnly cookie
                try {
                    await api.post('/auth/logout');
                } catch {
                    // If API fails, still redirect — the cookie will expire naturally
                }

                // Hard redirect to login — ensures middleware sees no cookie on next request
                window.location.href = '/login';
            },
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
