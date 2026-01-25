'use client';

import { useSession } from 'next-auth/react';
import {
  hasRole,
  hasAllRoles,
  hasPermission,
  hasAllPermissions,
  getAllPermissions,
  isSuperAdmin,
  isAdmin,
} from '@/lib/roles';

export function useRole() {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles;

  return {
    roles: userRoles ?? [],
    hasRole: (requiredRoles: string[]) => hasRole(userRoles, requiredRoles),
    hasAllRoles: (requiredRoles: string[]) =>
      hasAllRoles(userRoles, requiredRoles),
    hasPermission: (requiredPermissions: string[]) =>
      hasPermission(userRoles, requiredPermissions),
    hasAllPermissions: (requiredPermissions: string[]) =>
      hasAllPermissions(userRoles, requiredPermissions),
    getAllPermissions: () => getAllPermissions(userRoles),
    isSuperAdmin: () => isSuperAdmin(userRoles),
    isAdmin: () => isAdmin(userRoles),
  };
}
