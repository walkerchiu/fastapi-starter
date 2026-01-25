import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useRole } from './useRole';
import type { Role } from '@/types/next-auth';

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

const mockRoles: Role[] = [
  {
    id: 1,
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Administrator role',
    isSystem: false,
    permissions: [
      {
        id: 1,
        code: 'users:read',
        name: 'Users Read',
        description: 'Read users',
      },
    ],
  },
];

describe('useRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty roles when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.roles).toEqual([]);
    expect(result.current.isAdmin).toBe(false);
  });

  it('returns authenticated state with roles', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          roles: mockRoles,
        },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.roles).toEqual(mockRoles);
    expect(result.current.isAdmin).toBe(true);
  });

  it('hasRole returns correct value', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { roles: mockRoles },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.hasRole('ADMIN')).toBe(true);
    expect(result.current.hasRole('SUPER_ADMIN')).toBe(false);
  });

  it('hasAnyRole returns correct value', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { roles: mockRoles },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.hasAnyRole(['ADMIN', 'SUPER_ADMIN'])).toBe(true);
    expect(result.current.hasAnyRole(['SUPER_ADMIN', 'moderator'])).toBe(false);
  });

  it('isAdmin returns true for admin role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { roles: mockRoles },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isSuperAdmin).toBe(false);
  });

  it('hasPermission returns correct value', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { roles: mockRoles },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.hasPermission('users:read')).toBe(true);
    expect(result.current.hasPermission('users:delete')).toBe(false);
  });

  it('hasResourcePermission returns correct value', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { roles: mockRoles },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.hasResourcePermission('users', 'read')).toBe(true);
    expect(result.current.hasResourcePermission('users', 'delete')).toBe(false);
  });

  it('returns empty roles when unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.roles).toEqual([]);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSuperAdmin).toBe(false);
  });
});
