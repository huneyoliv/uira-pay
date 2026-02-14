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
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string | null, user: User) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: (token, user) => {
                if (token) {
                    localStorage.setItem('auth-token', token);
                }
                set({ token, user, isAuthenticated: true });
            },
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout failed', error);
                } finally {
                    localStorage.removeItem('auth-token');
                    set({ token: null, user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
