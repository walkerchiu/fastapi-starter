import { auth } from '@/lib/auth';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { Role } from '@/types/next-auth';
import { routing } from './i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication (without locale prefix)
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const authRoutes = ['/login', '/register'];

/**
 * Role-protected routes configuration.
 * Each entry specifies a route path and the roles required to access it.
 */
interface RoleProtectedRoute {
  /** Route path (uses startsWith matching, without locale prefix) */
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

/**
 * Remove locale prefix from pathname for route matching.
 */
function removeLocalePrefix(pathname: string): string {
  const localePattern = /^\/(en|zh-TW)(\/|$)/;
  return pathname.replace(localePattern, '/');
}

/**
 * Get the locale from pathname.
 */
function getLocaleFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/(en|zh-TW)(\/|$)/);
  return match?.[1] ?? null;
}

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const userRoles = req.auth?.user?.roles;

  // Get pathname without locale prefix for route matching
  const pathnameWithoutLocale = removeLocalePrefix(nextUrl.pathname);
  const locale = getLocaleFromPathname(nextUrl.pathname);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  // Check if route requires specific roles
  const roleRoute = roleProtectedRoutes.find((route) =>
    pathnameWithoutLocale.startsWith(route.path),
  );

  // Redirect to login if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const loginPath = locale ? `/${locale}/login` : '/login';
    const loginUrl = new URL(loginPath, nextUrl);
    const callbackPath = isValidPathname(nextUrl.pathname)
      ? nextUrl.pathname
      : '/';
    loginUrl.searchParams.set('callbackUrl', callbackPath);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to login if role-protected route and not authenticated
  if (roleRoute && !isAuthenticated) {
    const loginPath = locale ? `/${locale}/login` : '/login';
    const loginUrl = new URL(loginPath, nextUrl);
    const callbackPath = isValidPathname(nextUrl.pathname)
      ? nextUrl.pathname
      : '/';
    loginUrl.searchParams.set('callbackUrl', callbackPath);
    return NextResponse.redirect(loginUrl);
  }

  // Check role access for role-protected routes
  if (roleRoute && isAuthenticated) {
    if (!hasAnyRole(userRoles, roleRoute.roles)) {
      const unauthorizedPath = locale
        ? `/${locale}/unauthorized`
        : '/unauthorized';
      const unauthorizedUrl = new URL(unauthorizedPath, nextUrl);
      unauthorizedUrl.searchParams.set('from', nextUrl.pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  if (isAuthRoute && isAuthenticated) {
    const homePath = locale ? `/${locale}` : '/';
    return NextResponse.redirect(new URL(homePath, nextUrl));
  }

  // Run i18n middleware for locale handling
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Next.js internals (_next)
    // - Static files
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
