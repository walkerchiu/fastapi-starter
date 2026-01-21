'use client';

import { ReactNode } from 'react';
import { useRole } from '@/hooks';

/**
 * Props for the RequireRole component.
 */
export interface RequireRoleProps {
  /** Required role codes */
  roles: string[];
  /** If true, require all roles (AND logic). If false, require any role (OR logic). */
  requireAll?: boolean;
  /** Content to render when authorized */
  children: ReactNode;
  /** Content to render when unauthorized (optional) */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user roles.
 * Use this for role-based UI visibility.
 */
export function RequireRole({
  roles,
  requireAll = false,
  children,
  fallback = null,
}: RequireRoleProps): ReactNode {
  const { hasAnyRole, hasAllRoles } = useRole();

  const hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

/**
 * Props for admin-only components.
 */
export interface RequireAdminProps {
  /** Content to render when authorized */
  children: ReactNode;
  /** Content to render when unauthorized (optional) */
  fallback?: ReactNode;
}

/**
 * Shortcut component for admin-only content.
 * Allows access for users with 'admin' or 'super_admin' role.
 */
export function RequireAdmin({
  children,
  fallback = null,
}: RequireAdminProps): ReactNode {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return fallback;
  }

  return children;
}

/**
 * Shortcut component for super-admin-only content.
 * Allows access only for users with 'SUPER_ADMIN' role.
 */
export function RequireSuperAdmin({
  children,
  fallback = null,
}: RequireAdminProps): ReactNode {
  const { isSuperAdmin } = useRole();

  if (!isSuperAdmin) {
    return fallback;
  }

  return children;
}

/**
 * Props for permission-based components.
 */
export interface RequirePermissionProps {
  /** Required permission code */
  permission: string;
  /** Content to render when authorized */
  children: ReactNode;
  /** Content to render when unauthorized (optional) */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on permission.
 */
export function RequirePermission({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps): ReactNode {
  const { hasPermission } = useRole();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
}
