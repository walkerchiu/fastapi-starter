import { authExchange } from '@urql/exchange-auth';
import { cacheExchange, Client, fetchExchange } from 'urql';
import { env } from '@/config/env';

// Error codes that indicate authentication failure
const AUTH_ERROR_CODES = ['UNAUTHENTICATED', 'FORBIDDEN', 'INVALID_TOKEN'];

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
            // Check for authentication errors in GraphQL response
            return error.graphQLErrors.some((e) => {
              const code = e.extensions?.['code'];
              return AUTH_ERROR_CODES.includes(code as string);
            });
          },
          willAuthError() {
            // Check if we have a token, if not, we'll get an auth error
            const token = getToken?.();
            return !token;
          },
          async refreshAuth() {
            // Token refresh is handled automatically by NextAuth.
            // When the session updates, the GraphQL provider will recreate
            // the client with the new token.
            // This function is called when didAuthError returns true,
            // which triggers a retry of the failed operation.
          },
        };
      }),
      fetchExchange,
    ],
  });
}

// Default client without auth (for server-side or public queries)
export const graphqlClient = createGraphQLClient();
