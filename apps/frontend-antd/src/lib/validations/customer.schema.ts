import { z } from 'zod';

// Customer status schema
export const customerStatusSchema = z.enum(['active', 'inactive', 'blocked']);

// Customer tier schema
export const customerTierSchema = z.enum([
  'regular',
  'silver',
  'gold',
  'platinum',
]);

// Email validation
const emailSchema = z.string().email('Invalid email format');

// Phone validation
const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format')
  .max(20)
  .optional();

// Address schema
const addressSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  isDefault: z.boolean().default(false),
});

// Create customer schema
export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  phone: phoneSchema,
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// Update customer schema
export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  status: customerStatusSchema.optional(),
  tier: customerTierSchema.optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// Add customer address schema
export const addCustomerAddressSchema = addressSchema;

// Update customer address schema
export const updateCustomerAddressSchema = addressSchema.partial();

// Customer filter schema
export const customerFilterSchema = z.object({
  search: z.string().optional(),
  status: customerStatusSchema.optional(),
  tier: customerTierSchema.optional(),
  tags: z.array(z.string()).optional(),
  minTotalSpent: z.number().min(0).optional(),
  maxTotalSpent: z.number().min(0).optional(),
  hasOrders: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Import customers schema
export const importCustomersSchema = z.object({
  file: z.any(), // File object
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
});

// Types
export type CustomerStatus = z.infer<typeof customerStatusSchema>;
export type CustomerTier = z.infer<typeof customerTierSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddCustomerAddressInput = z.infer<typeof addCustomerAddressSchema>;
export type UpdateCustomerAddressInput = z.infer<
  typeof updateCustomerAddressSchema
>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
export type ImportCustomersInput = z.infer<typeof importCustomersSchema>;
