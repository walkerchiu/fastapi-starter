'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import type { Role, Permission } from '@/types/next-auth';

/**
 * Return type for the useRole hook.
 */
export interface UseRoleReturn {
  /** User's roles */
  roles: Role[];
  /** Check if user has a specific role by code */
  hasRole: (roleCode: string) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roleCodes: string[]) => boolean;
  /** Check if user has all of the specified roles */
  hasAllRoles: (roleCodes: string[]) => boolean;
  /** Check if user is an admin (has 'ADMIN' or 'SUPER_ADMIN' role) */
  isAdmin: boolean;
  /** Check if user is a super admin */
  isSuperAdmin: boolean;
  /** Check if user has a specific permission by code */
  hasPermission: (permissionCode: string) => boolean;
  /** Check if user has permission for a resource action (e.g., 'users:read') */
  hasResourcePermission: (resource: string, action: string) => boolean;
  /** Get all permissions from all roles */
  permissions: Permission[];
}

/**
 * Hook for role-based access control.
 * Provides utilities for checking user roles and permissions.
 */
export function useRole(): UseRoleReturn {
  const { data: session } = useSession();

  const roles = useMemo(() => {
    return session?.user?.roles ?? [];
  }, [session?.user?.roles]);

  const permissions = useMemo(() => {
    const permissionMap = new Map<string, Permission>();
    roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        if (!permissionMap.has(permission.code)) {
          permissionMap.set(permission.code, permission);
        }
      });
    });
    return Array.from(permissionMap.values());
  }, [roles]);

  const hasRole = useMemo(() => {
    return (roleCode: string): boolean => {
      return roles.some(
        (role) => role.code.toLowerCase() === roleCode.toLowerCase(),
      );
    };
  }, [roles]);

  const hasAnyRole = useMemo(() => {
    return (roleCodes: string[]): boolean => {
      return roleCodes.some((code) =>
        roles.some((role) => role.code.toLowerCase() === code.toLowerCase()),
      );
    };
  }, [roles]);

  const hasAllRoles = useMemo(() => {
    return (roleCodes: string[]): boolean => {
      return roleCodes.every((code) =>
        roles.some((role) => role.code.toLowerCase() === code.toLowerCase()),
      );
    };
  }, [roles]);

  const isAdmin = useMemo(() => {
    return hasAnyRole(['ADMIN', 'SUPER_ADMIN']);
  }, [hasAnyRole]);

  const isSuperAdmin = useMemo(() => {
    return hasRole('SUPER_ADMIN');
  }, [hasRole]);

  const hasPermission = useMemo(() => {
    return (permissionCode: string): boolean => {
      return permissions.some(
        (permission) =>
          permission.code.toLowerCase() === permissionCode.toLowerCase(),
      );
    };
  }, [permissions]);

  const hasResourcePermission = useMemo(() => {
    return (resource: string, action: string): boolean => {
      const permissionCode = `${resource}:${action}`.toLowerCase();
      return permissions.some(
        (permission) => permission.code.toLowerCase() === permissionCode,
      );
    };
  }, [permissions]);

  return {
    roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isSuperAdmin,
    hasPermission,
    hasResourcePermission,
    permissions,
  };
}
