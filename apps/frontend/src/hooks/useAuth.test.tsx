import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  describe('when session is loading', () => {
    it('should return loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
    });
  });

  describe('when user is not authenticated', () => {
    it('should return unauthenticated state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.hasRefreshError).toBe(false);
    });
  });

  describe('when user is authenticated', () => {
    it('should return user data', () => {
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

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
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
      expect(result.current.accessToken).toBe('mock-access-token');
      expect(result.current.hasRefreshError).toBe(false);
    });

    it('should handle empty roles', () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
        accessToken: 'mock-access-token',
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user?.roles).toEqual([]);
    });
  });

  describe('when there is a refresh token error', () => {
    it('should detect RefreshTokenError', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test' },
          accessToken: 'token',
          error: 'RefreshTokenError',
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRefreshError).toBe(true);
    });

    it('should detect RefreshTokenExpired', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test' },
          accessToken: 'token',
          error: 'RefreshTokenExpired',
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRefreshError).toBe(true);
    });

    it('should detect RefreshTokenMissing', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test' },
          accessToken: 'token',
          error: 'RefreshTokenMissing',
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRefreshError).toBe(true);
    });
  });

  describe('login', () => {
    it('should call signIn with credentials', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
      mockSignIn.mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useAuth());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123');
      });

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
      expect(success).toBe(true);
    });

    it('should return false on login failure', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' });

      const { result } = renderHook(() => useAuth());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.login(
          'test@example.com',
          'wrongpassword',
        );
      });

      expect(success).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call signOut with default callback URL', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test' },
          accessToken: 'token',
        },
        status: 'authenticated',
      });
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
    });

    it('should call signOut with custom callback URL', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test' },
          accessToken: 'token',
        },
        status: 'authenticated',
      });
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout('/custom-page');
      });

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/custom-page' });
    });
  });
});
