import { authExchange } from '@urql/exchange-auth';
import { cacheExchange, Client, fetchExchange } from 'urql';
import { env } from '@/config/env';

export function createGraphQLClient(getToken?: () => string | null) {
  return new Client({
    url: `${env.NEXT_PUBLIC_API_URL}/graphql`,
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            const token = getToken?.();
            if (!token) return operation;
            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${token}`,
            });
          },
          didAuthError(error) {
            return error.graphQLErrors.some(
              (e) => e.extensions?.['code'] === 'FORBIDDEN',
            );
          },
          async refreshAuth() {
            // Token refresh is handled by next-auth
          },
        };
      }),
      fetchExchange,
    ],
  });
}

// Default client without auth (for server-side or public queries)
export const graphqlClient = createGraphQLClient();
