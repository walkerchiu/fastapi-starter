import { z } from 'zod';

// Webhook status schema
export const webhookStatusSchema = z.enum(['active', 'inactive']);

// Webhook URL validation
const webhookUrlSchema = z
  .string()
  .url('Invalid webhook URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        // Allow localhost for development
        if (
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1'
        ) {
          return true;
        }
        // Require HTTPS for production
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    {
      message: 'Webhook URL must use HTTPS (localhost allowed for development)',
    },
  );

// Available webhook events
export const WEBHOOK_EVENTS = [
  'order.created',
  'order.updated',
  'order.cancelled',
  'order.paid',
  'order.shipped',
  'order.delivered',
  'product.created',
  'product.updated',
  'product.deleted',
  'customer.created',
  'customer.updated',
  'refund.created',
  'refund.completed',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

// Create webhook schema
export const createWebhookSchema = z.object({
  url: webhookUrlSchema,
  appId: z.string().optional(),
  events: z
    .array(z.enum(WEBHOOK_EVENTS))
    .min(1, 'At least one event must be selected')
    .max(WEBHOOK_EVENTS.length),
});

// Update webhook schema
export const updateWebhookSchema = z.object({
  url: webhookUrlSchema.optional(),
  events: z
    .array(z.enum(WEBHOOK_EVENTS))
    .min(1)
    .max(WEBHOOK_EVENTS.length)
    .optional(),
  status: webhookStatusSchema.optional(),
});

// Webhook filter schema
export const webhookFilterSchema = z.object({
  developerId: z.string().optional(),
  appId: z.string().optional(),
  status: webhookStatusSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Test webhook schema
export const testWebhookSchema = z.object({
  webhookId: z.string().min(1, 'Webhook ID is required'),
  eventType: z.enum(WEBHOOK_EVENTS),
  payload: z.record(z.string(), z.unknown()).optional(),
});

// Types
export type WebhookStatus = z.infer<typeof webhookStatusSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
export type WebhookFilterInput = z.infer<typeof webhookFilterSchema>;
export type TestWebhookInput = z.infer<typeof testWebhookSchema>;
