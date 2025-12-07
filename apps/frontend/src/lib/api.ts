import { client } from '@repo/api-client';
import { env } from '@/config/env';

if (env.NEXT_PUBLIC_API_URL) {
  client.setConfig({
    baseUrl: env.NEXT_PUBLIC_API_URL,
  });
}

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
