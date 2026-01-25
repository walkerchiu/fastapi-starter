import { z } from 'zod';

// App type schema
export const appTypeSchema = z.enum(['web', 'mobile', 'server']);

// App status schema
export const appStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'suspended',
]);

// URL validation
const urlSchema = z.string().url('Invalid URL format');

// Redirect URI validation
const redirectUriSchema = z
  .string()
  .url('Invalid redirect URI')
  .refine(
    (uri) => {
      try {
        const url = new URL(uri);
        // Allow localhost for development
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          return true;
        }
        // Require HTTPS for production
        return url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    {
      message:
        'Redirect URI must use HTTPS (localhost allowed for development)',
    },
  );

// Available OAuth scopes
export const OAUTH_SCOPES = [
  'read:profile',
  'write:profile',
  'read:orders',
  'write:orders',
  'read:products',
  'write:products',
  'read:customers',
  'write:customers',
  'read:analytics',
] as const;

export type OAuthScope = (typeof OAUTH_SCOPES)[number];

// Create app schema
export const createAppSchema = z.object({
  name: z
    .string()
    .min(3, 'App name must be at least 3 characters')
    .max(100, 'App name must be less than 100 characters'),
  description: z.string().max(1000).optional(),
  redirectUris: z
    .array(redirectUriSchema)
    .min(1, 'At least one redirect URI is required')
    .max(10, 'Maximum 10 redirect URIs allowed'),
  scopes: z.array(z.enum(OAUTH_SCOPES)).optional(),
  type: appTypeSchema,
  logoUrl: urlSchema.optional(),
  websiteUrl: urlSchema.optional(),
  privacyPolicyUrl: urlSchema.optional(),
  termsOfServiceUrl: urlSchema.optional(),
});

// Update app schema
export const updateAppSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  redirectUris: z.array(redirectUriSchema).min(1).max(10).optional(),
  scopes: z.array(z.enum(OAUTH_SCOPES)).optional(),
  logoUrl: urlSchema.optional().nullable(),
  websiteUrl: urlSchema.optional().nullable(),
  privacyPolicyUrl: urlSchema.optional().nullable(),
  termsOfServiceUrl: urlSchema.optional().nullable(),
});

// App filter schema
export const appFilterSchema = z.object({
  search: z.string().optional(),
  developerId: z.string().optional(),
  status: appStatusSchema.optional(),
  type: appTypeSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Create API key schema
export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .max(100, 'Name must be less than 100 characters'),
  appId: z.string().optional(),
  scopes: z.array(z.enum(OAUTH_SCOPES)).optional(),
  expiresAt: z.string().optional(),
});

// Types
export type AppType = z.infer<typeof appTypeSchema>;
export type AppStatus = z.infer<typeof appStatusSchema>;
export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export type AppFilterInput = z.infer<typeof appFilterSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
