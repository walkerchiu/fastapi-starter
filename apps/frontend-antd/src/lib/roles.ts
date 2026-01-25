import type { Role, Permission } from '@/types/next-auth';

/**
 * Check if user has any of the specified roles
 */
export function hasRole(
  userRoles: Role[] | undefined,
  requiredRoles: string[],
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  return userRoles.some((role) => requiredRoles.includes(role.name));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(
  userRoles: Role[] | undefined,
  requiredRoles: string[],
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  const roleNames = userRoles.map((role) => role.name);
  return requiredRoles.every((required) => roleNames.includes(required));
}

/**
 * Check if user has any of the specified permissions
 */
export function hasPermission(
  userRoles: Role[] | undefined,
  requiredPermissions: string[],
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  const userPermissions = userRoles.flatMap(
    (role) => role.permissions?.map((p: Permission) => p.name) ?? [],
  );

  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userRoles: Role[] | undefined,
  requiredPermissions: string[],
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  const userPermissions = userRoles.flatMap(
    (role) => role.permissions?.map((p: Permission) => p.name) ?? [],
  );

  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
}

/**
 * Get all permission names from user roles
 */
export function getAllPermissions(userRoles: Role[] | undefined): string[] {
  if (!userRoles || userRoles.length === 0) {
    return [];
  }

  return [
    ...new Set(
      userRoles.flatMap(
        (role) => role.permissions?.map((p: Permission) => p.name) ?? [],
      ),
    ),
  ];
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(userRoles: Role[] | undefined): boolean {
  return hasRole(userRoles, ['super_admin']);
}

/**
 * Check if user is an admin (super_admin or admin)
 */
export function isAdmin(userRoles: Role[] | undefined): boolean {
  return hasRole(userRoles, ['super_admin', 'admin']);
}
