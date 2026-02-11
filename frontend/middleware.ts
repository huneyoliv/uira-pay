import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/admin', '/transactions', '/settings', '/withdrawals'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Define auth routes (login/register)
    const authRoutes = ['/login', '/register'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // 1. If trying to access protected route without token -> Redirect to login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        // Optional: Add redirect param to return after login
        // loginUrl.searchParams.set('redirect', pathname); 
        return NextResponse.redirect(loginUrl);
    }

    // 2. If trying to access auth routes (login/register) WITH token -> Redirect to dashboard
    if (isAuthRoute && token) {
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
