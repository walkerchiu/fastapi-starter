import { Client, cacheExchange, fetchExchange } from 'urql';
import { authExchange } from '@urql/exchange-auth';
import { env } from '@/config/env';

export function createGraphQLClient(getToken: () => string | null) {
  return new Client({
    url: env.NEXT_PUBLIC_GRAPHQL_URL,
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            const token = getToken();
            if (!token) return operation;

            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${token}`,
            });
          },
          didAuthError(error) {
            return error.graphQLErrors.some(
              (e) => e.extensions?.['code'] === 'UNAUTHENTICATED',
            );
          },
          async refreshAuth() {
            // Token refresh is handled by NextAuth
          },
        };
      }),
      fetchExchange,
    ],
  });
}
