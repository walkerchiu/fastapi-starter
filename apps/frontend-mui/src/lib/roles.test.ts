import { describe, expect, it } from 'vitest';
import type { Session } from 'next-auth';
import type { Role } from '@/types/next-auth';
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isSuperAdmin,
  isAdmin,
  getUserRoles,
  getUserRoleCodes,
  hasPermission,
  hasResourcePermission,
} from './roles';

const mockPermissions = [
  {
    id: 1,
    code: 'users:read',
    name: 'Users Read',
    description: 'Read users',
  },
  {
    id: 2,
    code: 'users:create',
    name: 'Users Create',
    description: 'Create users',
  },
];

const mockRoles: Role[] = [
  {
    id: 1,
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Administrator role',
    isSystem: false,
    permissions: mockPermissions,
  },
  {
    id: 2,
    code: 'user',
    name: 'User',
    description: 'Regular user',
    isSystem: false,
    permissions: [mockPermissions[0]!],
  },
];

const createMockSession = (roles: Role[]): Session => ({
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    accessTokenExpires: Date.now() + 3600000,
    roles,
  },
  accessToken: 'test-token',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

describe('roles utility functions', () => {
  describe('hasRole', () => {
    it('returns true when user has the specified role', () => {
      const session = createMockSession(mockRoles);
      expect(hasRole(session, 'ADMIN')).toBe(true);
    });

    it('returns false when user does not have the specified role', () => {
      const session = createMockSession(mockRoles);
      expect(hasRole(session, 'SUPER_ADMIN')).toBe(false);
    });

    it('returns false when session is null', () => {
      expect(hasRole(null, 'ADMIN')).toBe(false);
    });

    it('returns false when user has no roles', () => {
      const session = createMockSession([]);
      expect(hasRole(session, 'ADMIN')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('returns true when user has at least one of the specified roles', () => {
      const session = createMockSession(mockRoles);
      expect(hasAnyRole(session, ['ADMIN', 'SUPER_ADMIN'])).toBe(true);
    });

    it('returns false when user has none of the specified roles', () => {
      const session = createMockSession(mockRoles);
      expect(hasAnyRole(session, ['SUPER_ADMIN', 'moderator'])).toBe(false);
    });

    it('returns false when session is null', () => {
      expect(hasAnyRole(null, ['ADMIN'])).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('returns true when user has all specified roles', () => {
      const session = createMockSession(mockRoles);
      expect(hasAllRoles(session, ['ADMIN', 'user'])).toBe(true);
    });

    it('returns false when user is missing some roles', () => {
      const session = createMockSession(mockRoles);
      expect(hasAllRoles(session, ['ADMIN', 'SUPER_ADMIN'])).toBe(false);
    });

    it('returns false when session is null', () => {
      expect(hasAllRoles(null, ['ADMIN'])).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    it('returns true when user has super_admin role', () => {
      const superAdminRole: Role = {
        id: 1,
        code: 'SUPER_ADMIN',
        name: 'Super Admin',
        description: 'Super Admin',
        isSystem: true,
        permissions: [],
      };
      const session = createMockSession([superAdminRole]);
      expect(isSuperAdmin(session)).toBe(true);
    });

    it('returns false when user does not have super_admin role', () => {
      const session = createMockSession(mockRoles);
      expect(isSuperAdmin(session)).toBe(false);
    });

    it('returns false when session is null', () => {
      expect(isSuperAdmin(null)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true when user has admin role', () => {
      const session = createMockSession(mockRoles);
      expect(isAdmin(session)).toBe(true);
    });

    it('returns true when user has super_admin role', () => {
      const superAdminRole: Role = {
        id: 1,
        code: 'SUPER_ADMIN',
        name: 'Super Admin',
        description: 'Super Admin',
        isSystem: true,
        permissions: [],
      };
      const session = createMockSession([superAdminRole]);
      expect(isAdmin(session)).toBe(true);
    });

    it('returns false when user has neither admin nor super_admin role', () => {
      const userRole: Role = {
        id: 1,
        code: 'user',
        name: 'User',
        description: 'User',
        isSystem: false,
        permissions: [],
      };
      const session = createMockSession([userRole]);
      expect(isAdmin(session)).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('returns user roles from session', () => {
      const session = createMockSession(mockRoles);
      expect(getUserRoles(session)).toEqual(mockRoles);
    });

    it('returns empty array when session is null', () => {
      expect(getUserRoles(null)).toEqual([]);
    });
  });

  describe('getUserRoleCodes', () => {
    it('returns role codes from session', () => {
      const session = createMockSession(mockRoles);
      expect(getUserRoleCodes(session)).toEqual(['ADMIN', 'user']);
    });

    it('returns empty array when session is null', () => {
      expect(getUserRoleCodes(null)).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    it('returns true when user has the specified permission', () => {
      const session = createMockSession(mockRoles);
      expect(hasPermission(session, 'users:read')).toBe(true);
    });

    it('returns false when user does not have the specified permission', () => {
      const session = createMockSession(mockRoles);
      expect(hasPermission(session, 'users:delete')).toBe(false);
    });

    it('returns false when session is null', () => {
      expect(hasPermission(null, 'users:read')).toBe(false);
    });
  });

  describe('hasResourcePermission', () => {
    it('returns true when user has permission for resource and action', () => {
      const session = createMockSession(mockRoles);
      expect(hasResourcePermission(session, 'users', 'read')).toBe(true);
    });

    it('returns false when user lacks permission for resource and action', () => {
      const session = createMockSession(mockRoles);
      expect(hasResourcePermission(session, 'users', 'delete')).toBe(false);
    });

    it('returns false when session is null', () => {
      expect(hasResourcePermission(null, 'users', 'read')).toBe(false);
    });
  });
});
