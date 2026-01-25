import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_GRAPHQL_URL: z
    .string()
    .url()
    .default('http://localhost:3001/graphql'),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env['NODE_ENV'],
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
    NEXT_PUBLIC_GRAPHQL_URL: process.env['NEXT_PUBLIC_GRAPHQL_URL'],
  });

  if (!parsed.success) {
    console.error(
      'Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();
