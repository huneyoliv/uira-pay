import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : (process.env.NEXT_PUBLIC_DOMAIN ? `https://api.${process.env.NEXT_PUBLIC_DOMAIN}` : 'https://api.swaptune.me');

console.log('API Client Config:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    baseURL
});

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
        if (error.response?.status === 401) {
            localStorage.removeItem('auth-token');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
