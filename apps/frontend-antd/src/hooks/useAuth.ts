'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import type { Role } from '@/types/next-auth';

export interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name?: string | null;
    roles?: Role[];
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  error: string | undefined;
  signIn: typeof signIn;
  signOut: typeof signOut;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    accessToken: session?.accessToken ?? null,
    error: session?.error,
    signIn,
    signOut,
  };
}
