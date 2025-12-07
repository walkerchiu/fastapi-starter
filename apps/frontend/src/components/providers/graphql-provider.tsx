'use client';

import { useMemo } from 'react';
import { Provider } from 'urql';
import { useSession } from 'next-auth/react';
import { createGraphQLClient } from '@/lib/graphql-client';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  const { data: session } = useSession();

  const client = useMemo(() => {
    return createGraphQLClient(() => session?.accessToken ?? null);
  }, [session?.accessToken]);

  return <Provider value={client}>{children}</Provider>;
}
