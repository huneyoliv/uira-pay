import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Basic JWT validation (structure + expiration check without secret)
    let isTokenValid = false;
    if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
            try {
                const payload = JSON.parse(atob(parts[1]));
                // Check if token has not expired
                if (payload.exp && payload.exp > Date.now() / 1000) {
                    isTokenValid = true;
                }
            } catch {
                // Invalid base64 or JSON — treat as no token
            }
        }
    }

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/admin', '/transactions', '/settings', '/withdrawals'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Define auth routes (login/register)
    const authRoutes = ['/login', '/register'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // 1. If trying to access protected route without valid token -> Redirect to login
    if (isProtectedRoute && !isTokenValid) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 2. If trying to access auth routes (login/register) WITH valid token -> Redirect to dashboard
    if (isAuthRoute && isTokenValid) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
