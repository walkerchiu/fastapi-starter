import type { Session } from 'next-auth';
import type { Role } from '@/types/next-auth';

/**
 * Check if user has a specific role.
 */
export function hasRole(session: Session | null, roleCode: string): boolean {
  if (!session?.user?.roles) {
    return false;
  }
  return session.user.roles.some((role) => role.code === roleCode);
}

/**
 * Check if user has any of the specified roles.
 */
export function hasAnyRole(
  session: Session | null,
  roleCodes: string[],
): boolean {
  if (!session?.user?.roles) {
    return false;
  }
  return session.user.roles.some((role) => roleCodes.includes(role.code));
}

/**
 * Check if user has all of the specified roles.
 */
export function hasAllRoles(
  session: Session | null,
  roleCodes: string[],
): boolean {
  if (!session?.user?.roles) {
    return false;
  }
  const userRoleCodes = session.user.roles.map((role) => role.code);
  return roleCodes.every((roleCode) => userRoleCodes.includes(roleCode));
}

/**
 * Check if user is a super admin.
 */
export function isSuperAdmin(session: Session | null): boolean {
  return hasRole(session, 'SUPER_ADMIN');
}

/**
 * Check if user is an admin (includes super_admin).
 */
export function isAdmin(session: Session | null): boolean {
  return hasAnyRole(session, ['SUPER_ADMIN', 'ADMIN']);
}

/**
 * Get user roles from session.
 */
export function getUserRoles(session: Session | null): Role[] {
  return session?.user?.roles || [];
}

/**
 * Get user role codes from session.
 */
export function getUserRoleCodes(session: Session | null): string[] {
  return getUserRoles(session).map((role) => role.code);
}

/**
 * Check if user has a specific permission.
 */
export function hasPermission(
  session: Session | null,
  permissionCode: string,
): boolean {
  if (!session?.user?.roles) {
    return false;
  }
  return session.user.roles.some((role) =>
    role.permissions?.some((permission) => permission.code === permissionCode),
  );
}

/**
 * Check if user has permission for a specific resource and action.
 */
export function hasResourcePermission(
  session: Session | null,
  resource: string,
  action: string,
): boolean {
  return hasPermission(session, `${resource}:${action}`);
}
