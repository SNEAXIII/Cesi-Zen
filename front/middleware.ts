import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/', '/api/auth', '/login', '/register', '/articles'];
const ADMIN_PATHS = ['/dashboard', '/admin', '/articles/create'];

function isPathMatching(path: string, paths: string[]): boolean {
  return paths.some((basePath) => path === basePath || path.startsWith(`${basePath}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isTokenExpired = token?.expired;

  console.log('Middleware triggered for path:', pathname);
  console.log('Token status:', isTokenExpired ? 'expired' : 'valid');

  // 1. Redirect authenticated users away from login/register pages
  if (token && !isTokenExpired && (pathname === '/login' || pathname === '/register')) {
    console.log('Authenticated user accessing /login or /register, redirecting to /');
    return NextResponse.redirect(new URL('/', request.url));
  }
  // 2. Allow public paths without authentication
  if (isPathMatching(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }
  // 3. Redirect unauthenticated users
  if (!token) {
    console.log('No token detected, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  // 4. Handle expired tokens
  if (isTokenExpired) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // 5. Restrict admin paths to admin users
  if (isPathMatching(pathname, ADMIN_PATHS) && token?.role !== 'admin') {
    console.log('Non-admin user attempting to access admin path, redirecting to /');
    return NextResponse.redirect(new URL('/', request.url));
  }
  // 6. For all other cases, continue
  return NextResponse.next();
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
};
