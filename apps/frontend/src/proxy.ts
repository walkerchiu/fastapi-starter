import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { Role } from '@/types/next-auth';

const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const authRoutes = ['/login', '/register'];

/**
 * Role-protected routes configuration.
 * Each entry specifies a route path and the roles required to access it.
 */
interface RoleProtectedRoute {
  /** Route path (uses startsWith matching) */
  path: string;
  /** Required role codes (OR logic - any role grants access) */
  roles: string[];
}

const roleProtectedRoutes: RoleProtectedRoute[] = [
  { path: '/admin', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { path: '/super-admin', roles: ['SUPER_ADMIN'] },
];

// Validate pathname to prevent open redirect attacks
function isValidPathname(pathname: string): boolean {
  return pathname.startsWith('/') && !pathname.startsWith('//');
}

/**
 * Check if user has any of the required roles.
 */
function hasAnyRole(
  userRoles: Role[] | undefined,
  requiredRoles: string[],
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  return requiredRoles.some((required) =>
    userRoles.some(
      (role) => role.code.toLowerCase() === required.toLowerCase(),
    ),
  );
}

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const userRoles = req.auth?.user?.roles;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  // Check if route requires specific roles
  const roleRoute = roleProtectedRoutes.find((route) =>
    nextUrl.pathname.startsWith(route.path),
  );

  // Redirect to login if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', nextUrl);
    const callbackPath = isValidPathname(nextUrl.pathname)
      ? nextUrl.pathname
      : '/';
    loginUrl.searchParams.set('callbackUrl', callbackPath);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to login if role-protected route and not authenticated
  if (roleRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', nextUrl);
    const callbackPath = isValidPathname(nextUrl.pathname)
      ? nextUrl.pathname
      : '/';
    loginUrl.searchParams.set('callbackUrl', callbackPath);
    return NextResponse.redirect(loginUrl);
  }

  // Check role access for role-protected routes
  if (roleRoute && isAuthenticated) {
    if (!hasAnyRole(userRoles, roleRoute.roles)) {
      const unauthorizedUrl = new URL('/unauthorized', nextUrl);
      unauthorizedUrl.searchParams.set('from', nextUrl.pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
