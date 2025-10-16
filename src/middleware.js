import { ROUTES } from '@/utils/constant';
import { getServerSession } from '@/utils/lib.server';
import { NextResponse } from 'next/server';

// ROUTE FOR USER AND ADMIN
const MAP_ROUTES = {
    user: {
        protected: [ROUTES.login, ROUTES.signup, ROUTES.forgotPassword, ROUTES.resetPassword],
        private: [ROUTES.userDashboardMain, ROUTES.userDashboard],
    }
};

export async function middleware(request) {
    const { pathname } = request.nextUrl;


    // Prevent redirect loops by checking if we're already redirecting to the target
    const redirectTo = (url) => {
        if (request.nextUrl.pathname === url) {
            return NextResponse.next(); // Avoid looping
        }
        return NextResponse.redirect(new URL(url, request.url));
    };

    // User routes (unchanged for brevity, adjust if needed)
    if (MAP_ROUTES.user.protected.includes(pathname) || (MAP_ROUTES.user.private.some((route) => pathname === route || pathname.startsWith(`${route}/`)))) {
        const session = await getServerSession(request);
        const isUserAuthenticated = Boolean(session);

        if (isUserAuthenticated && MAP_ROUTES.user.protected.includes(pathname)) {
            return redirectTo(ROUTES.userDashboardMain);
        }
        if (!isUserAuthenticated && MAP_ROUTES.user.private.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
            return redirectTo(ROUTES.login);
        }
    }

    return NextResponse.next();
}

// Dynamic matcher based on configured routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|site.webmanifest|favicon.ico|sitemap.xml|robots.txt).*)',
        '/_next/data/:path*', // Explicitly include data routes
    ],
};