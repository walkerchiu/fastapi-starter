import { client } from '@repo/api-client';
import { env } from '@/config/env';

// Configure base URL
client.setConfig({
  baseUrl: env.NEXT_PUBLIC_API_URL,
});

// Token getter function that will be set by the auth provider
let getAccessToken: (() => string | null) | undefined;

// Set the token getter function
export function setTokenGetter(getter: () => string | null) {
  getAccessToken = getter;
}

// Add auth interceptor
client.interceptors.request.use((request) => {
  const token = getAccessToken?.();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

// Add error interceptor for auth errors
client.interceptors.error.use((error, response) => {
  if (response?.status === 401) {
    // Token expired or invalid - will be handled by session provider
    console.warn('API request unauthorized');
  }
  return error;
});

// Manual implementation for root endpoint (not in OpenAPI spec)
export async function rootGet(): Promise<{
  data?: { message?: string };
  error?: unknown;
  request?: Request;
  response?: Response;
}> {
  const request = new Request(env.NEXT_PUBLIC_API_URL);
  try {
    const response = await fetch(request);
    if (!response.ok) {
      return { error: new Error(`HTTP ${response.status}`), request, response };
    }
    const data = await response.json();
    return { data, request, response };
  } catch (error) {
    return { error, request };
  }
}

export { client };
