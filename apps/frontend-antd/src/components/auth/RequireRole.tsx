'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Spin } from 'antd';

import { useRole } from '@/hooks/useRole';

interface RequireRoleProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireRole({
  children,
  roles = [],
  permissions = [],
  fallback,
  redirectTo = '/unauthorized',
}: RequireRoleProps) {
  const { status } = useSession();
  const router = useRouter();
  const { hasRole, hasPermission } = useRole();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const hasRequiredRole = roles.length === 0 || hasRole(roles);
    const hasRequiredPermission =
      permissions.length === 0 || hasPermission(permissions);

    if (!hasRequiredRole || !hasRequiredPermission) {
      if (!fallback) {
        router.push(redirectTo);
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    roles,
    permissions,
    hasRole,
    hasPermission,
    router,
    redirectTo,
    fallback,
  ]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '50vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasRequiredRole = roles.length === 0 || hasRole(roles);
  const hasRequiredPermission =
    permissions.length === 0 || hasPermission(permissions);

  if (!hasRequiredRole || !hasRequiredPermission) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

// Alias for backward compatibility
export const RequirePermission = RequireRole;
