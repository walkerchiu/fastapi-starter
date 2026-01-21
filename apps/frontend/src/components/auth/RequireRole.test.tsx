import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RequireRole, RequireAdmin, RequireSuperAdmin } from './RequireRole';
import type { Role } from '@/types/next-auth';

// Mock useRole hook
const mockUseRole = vi.fn();
vi.mock('@/hooks/useRole', () => ({
  useRole: () => mockUseRole(),
}));

const createMockUseRoleReturn = (roleNames: string[], isLoading = false) => ({
  session: { user: { roles: roleNames.map((name) => ({ name })) } },
  status: isLoading ? 'loading' : 'authenticated',
  isAuthenticated: !isLoading,
  isLoading,
  roles: roleNames.map((name) => ({ name })) as Role[],
  roleNames,
  hasRole: (roleName: string) => roleNames.includes(roleName),
  hasAnyRole: (roles: string[]) => roles.some((r) => roleNames.includes(r)),
  hasAllRoles: (roles: string[]) => roles.every((r) => roleNames.includes(r)),
  isAdmin: roleNames.includes('ADMIN') || roleNames.includes('SUPER_ADMIN'),
  isSuperAdmin: roleNames.includes('SUPER_ADMIN'),
  hasPermission: () => false,
  hasResourcePermission: () => false,
});

describe('RequireRole', () => {
  it('renders children when user has required role', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['ADMIN']));

    render(
      <RequireRole roles={['ADMIN']}>
        <div>Admin Content</div>
      </RequireRole>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders fallback when user lacks required role', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['user']));

    render(
      <RequireRole roles={['ADMIN']} fallback={<div>Access Denied</div>}>
        <div>Admin Content</div>
      </RequireRole>,
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('renders nothing when user lacks required role and no fallback', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['user']));

    const { container } = render(
      <RequireRole roles={['ADMIN']}>
        <div>Admin Content</div>
      </RequireRole>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders children when user has any of the specified roles', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['ADMIN']));

    render(
      <RequireRole roles={['ADMIN', 'SUPER_ADMIN']}>
        <div>Admin Content</div>
      </RequireRole>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('requires all roles when requireAll is true', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['ADMIN']));

    render(
      <RequireRole roles={['ADMIN', 'moderator']} requireAll>
        <div>Admin Content</div>
      </RequireRole>,
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when user has all required roles', () => {
    mockUseRole.mockReturnValue(
      createMockUseRoleReturn(['ADMIN', 'moderator']),
    );

    render(
      <RequireRole roles={['ADMIN', 'moderator']} requireAll>
        <div>Admin Content</div>
      </RequireRole>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});

describe('RequireAdmin', () => {
  it('renders children for admin users', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['ADMIN']));

    render(
      <RequireAdmin>
        <div>Admin Content</div>
      </RequireAdmin>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders children for super_admin users', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['SUPER_ADMIN']));

    render(
      <RequireAdmin>
        <div>Admin Content</div>
      </RequireAdmin>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders fallback for non-admin users', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['user']));

    render(
      <RequireAdmin fallback={<div>Not Admin</div>}>
        <div>Admin Content</div>
      </RequireAdmin>,
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Not Admin')).toBeInTheDocument();
  });
});

describe('RequireSuperAdmin', () => {
  it('renders children for super_admin users', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['SUPER_ADMIN']));

    render(
      <RequireSuperAdmin>
        <div>Super Admin Content</div>
      </RequireSuperAdmin>,
    );

    expect(screen.getByText('Super Admin Content')).toBeInTheDocument();
  });

  it('does not render children for admin users', () => {
    mockUseRole.mockReturnValue(createMockUseRoleReturn(['ADMIN']));

    const { container } = render(
      <RequireSuperAdmin>
        <div>Super Admin Content</div>
      </RequireSuperAdmin>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
