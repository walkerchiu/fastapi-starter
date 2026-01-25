import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';

// Mock next-auth/react
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockUseSession = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    it('should return null user', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
    });

    it('should not be loading', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('when session is loading', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });
    });

    it('should be loading', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('when user is authenticated', () => {
    const mockSession = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: [
          {
            id: 1,
            name: 'admin',
            description: null,
            isActive: true,
            permissions: [],
          },
        ],
      },
      accessToken: 'mock-access-token',
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('should return user data', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: [
          {
            id: 1,
            name: 'admin',
            description: null,
            isActive: true,
            permissions: [],
          },
        ],
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('mock-access-token');
    });

    it('should handle empty roles', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          accessToken: 'mock-access-token',
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user?.roles).toEqual([]);
    });

    it('should not have refresh error', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRefreshError).toBe(false);
    });
  });

  describe('when refresh token error occurs', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          accessToken: 'old-token',
          error: 'RefreshTokenError',
        },
        status: 'authenticated',
      });
    });

    it('should indicate refresh error', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRefreshError).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    it('should call signIn with credentials', async () => {
      mockSignIn.mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useAuth());

      const success = await result.current.login(
        'test@example.com',
        'password123',
      );

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
      expect(success).toBe(true);
    });

    it('should return false on login failure', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' });

      const { result } = renderHook(() => useAuth());

      const success = await result.current.login(
        'test@example.com',
        'wrongpassword',
      );

      expect(success).toBe(false);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-token',
        },
        status: 'authenticated',
      });
    });

    it('should call signOut with default callback', async () => {
      const { result } = renderHook(() => useAuth());

      await result.current.logout();

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
    });

    it('should call signOut with custom callback', async () => {
      const { result } = renderHook(() => useAuth());

      await result.current.logout('/');

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });
  });
});
