'use client';

import { useMemo, useEffect } from 'react';
import { Provider } from 'urql';
import { useSession, signOut } from 'next-auth/react';
import { createGraphQLClient } from '@/lib/graphql-client';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  const { data: session } = useSession();

  // Auto sign-out when refresh token fails
  useEffect(() => {
    if (
      session?.error === 'RefreshTokenError' ||
      session?.error === 'RefreshTokenExpired' ||
      session?.error === 'RefreshTokenMissing'
    ) {
      signOut({ callbackUrl: '/login' });
    }
  }, [session?.error]);

  const client = useMemo(() => {
    return createGraphQLClient(() => session?.accessToken ?? null);
  }, [session?.accessToken]);

  return <Provider value={client}>{children}</Provider>;
}
