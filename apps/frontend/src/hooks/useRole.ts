'use client';

import { useSession } from 'next-auth/react';
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isAdmin,
  isSuperAdmin,
  getUserRoles,
  getUserRoleCodes,
  hasPermission,
  hasResourcePermission,
} from '@/lib/roles';

/**
 * Hook to access role-based utilities with current session
 */
export function useRole() {
  const { data: session, status } = useSession();

  return {
    /** Current session */
    session,
    /** Session loading status */
    status,
    /** Whether user is authenticated */
    isAuthenticated: status === 'authenticated',
    /** Whether session is loading */
    isLoading: status === 'loading',
    /** User's roles */
    roles: getUserRoles(session),
    /** User's role codes */
    roleCodes: getUserRoleCodes(session),
    /** Check if user has a specific role by code */
    hasRole: (roleCode: string) => hasRole(session, roleCode),
    /** Check if user has any of the specified roles by code */
    hasAnyRole: (roleCodes: string[]) => hasAnyRole(session, roleCodes),
    /** Check if user has all of the specified roles by code */
    hasAllRoles: (roleCodes: string[]) => hasAllRoles(session, roleCodes),
    /** Check if user is an admin (includes super_admin) */
    isAdmin: isAdmin(session),
    /** Check if user is a super admin */
    isSuperAdmin: isSuperAdmin(session),
    /** Check if user has a specific permission by code */
    hasPermission: (permissionCode: string) =>
      hasPermission(session, permissionCode),
    /** Check if user has permission for a specific resource and action */
    hasResourcePermission: (resource: string, action: string) =>
      hasResourcePermission(session, resource, action),
  };
}
