import { z } from 'zod';

// Ticket category schema
export const ticketCategorySchema = z.enum([
  'general',
  'order',
  'payment',
  'refund',
  'shipping',
  'product',
  'account',
  'other',
]);

// Ticket priority schema
export const ticketPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Ticket status schema
export const ticketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
]);

// Create ticket schema
export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  category: ticketCategorySchema,
  priority: ticketPrioritySchema.default('medium'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must be less than 5000 characters'),
  orderId: z.string().optional(),
  attachments: z
    .array(z.string().url())
    .max(5, 'Maximum 5 attachments allowed')
    .optional(),
});

// Reply ticket schema
export const replyTicketSchema = z.object({
  content: z
    .string()
    .min(1, 'Reply content is required')
    .max(5000, 'Reply must be less than 5000 characters'),
  attachments: z.array(z.string().url()).max(5).optional(),
});

// Update ticket schema (for support staff)
export const updateTicketSchema = z.object({
  assigneeId: z.string().optional().nullable(),
  priority: ticketPrioritySchema.optional(),
  status: ticketStatusSchema.optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// Ticket filter schema
export const ticketFilterSchema = z.object({
  search: z.string().optional(),
  customerId: z.string().optional(),
  assigneeId: z.string().optional(),
  category: ticketCategorySchema.optional(),
  priority: ticketPrioritySchema.optional(),
  status: ticketStatusSchema.optional(),
  unassigned: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Assign ticket schema
export const assignTicketSchema = z.object({
  assigneeId: z.string().min(1, 'Assignee is required'),
  notes: z.string().max(500).optional(),
});

// Close ticket schema
export const closeTicketSchema = z.object({
  resolution: z.string().max(1000).optional(),
  satisfactionRating: z.number().min(1).max(5).optional(),
});

// Merge tickets schema
export const mergeTicketsSchema = z.object({
  sourceTicketIds: z
    .array(z.string())
    .min(1, 'At least one source ticket is required'),
  targetTicketId: z.string().min(1, 'Target ticket is required'),
});

// Types
export type TicketCategory = z.infer<typeof ticketCategorySchema>;
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;
export type TicketStatus = z.infer<typeof ticketStatusSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type TicketFilterInput = z.infer<typeof ticketFilterSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type CloseTicketInput = z.infer<typeof closeTicketSchema>;
export type MergeTicketsInput = z.infer<typeof mergeTicketsSchema>;
