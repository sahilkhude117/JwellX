import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // Allow access to landing page
        if (pathname === '/'){
            return NextResponse.next();
        }

        // Allow access to auth pages without token
        if (pathname.startsWith('/auth/')) {
            if (token) {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
            return NextResponse.next();
        }

        if (!token) {
            const signInUrl = new URL('/auth/signin', req.url);
            signInUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(signInUrl);
        }

        // role based access control for specific routes
        const userRole = token.role;

        if (pathname.startsWith('/admin') && userRole !== 'OWNER') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        if (pathname.startsWith('/settings') && 
                !['OWNER', 'ACCOUNTANT'].includes(userRole as string)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        // Reports routes - owner and accountant only
        if (pathname.startsWith('/reports') && !['OWNER', 'ACCOUNTANT'].includes(userRole as string)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        return NextResponse.next();
    },
    {
        callbacks: {
          authorized: ({ token, req }) => {
            // Allow access to public routes
            const { pathname } = req.nextUrl
            
            if (pathname === '/' ||
                pathname.startsWith('/auth/') || 
                pathname.startsWith('/api/auth/') ||
                pathname === '/unauthorized') {
              return true
            }
    
            // Require token for all other routes
            return !!token
          },
        },
    }
)

export const config = {
    matcher: [
        /*
        * Match all request paths except:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - public folder
        */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ]
}