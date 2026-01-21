'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import type { Role } from '@/types/next-auth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}

export interface UseAuthReturn {
  /** Current authenticated user */
  user: AuthUser | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether the session is loading */
  isLoading: boolean;
  /** Access token for API calls */
  accessToken: string | null;
  /** Whether there was a refresh token error */
  hasRefreshError: boolean;
  /** Sign in with email and password */
  login: (email: string, password: string) => Promise<boolean>;
  /** Sign out the user */
  logout: (callbackUrl?: string) => Promise<void>;
}

/**
 * Custom hook for authentication state and operations.
 * Provides a convenient interface for accessing user info and auth methods.
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const user = useMemo((): AuthUser | null => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.name ?? '',
      roles: session.user.roles ?? [],
    };
  }, [session?.user]);

  const isAuthenticated = !!session?.user;
  const isLoading = status === 'loading';
  const accessToken = session?.accessToken ?? null;
  const hasRefreshError =
    session?.error === 'RefreshTokenError' ||
    session?.error === 'RefreshTokenExpired' ||
    session?.error === 'RefreshTokenMissing';

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      return result?.ok ?? false;
    },
    [],
  );

  const logout = useCallback(async (callbackUrl = '/login'): Promise<void> => {
    await signOut({ callbackUrl });
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    hasRefreshError,
    login,
    logout,
  };
}
