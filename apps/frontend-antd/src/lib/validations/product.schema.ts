import { z } from 'zod';

// Price validation
const priceSchema = z
  .number()
  .min(0, 'Price must be a positive number')
  .max(999999999, 'Price exceeds maximum limit');

// SKU validation
const skuSchema = z
  .string()
  .min(1, 'SKU is required')
  .max(50, 'SKU must be less than 50 characters')
  .regex(
    /^[A-Za-z0-9-_]+$/,
    'SKU can only contain letters, numbers, hyphens, and underscores',
  );

// Product name validation
const productNameSchema = z
  .string()
  .min(1, 'Product name is required')
  .max(200, 'Product name must be less than 200 characters');

// Create product schema
export const createProductSchema = z.object({
  name: productNameSchema,
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  sku: skuSchema,
  price: priceSchema,
  compareAtPrice: priceSchema.optional(),
  costPrice: priceSchema.optional(),
  stock: z
    .number()
    .int()
    .min(0, 'Stock must be a non-negative integer')
    .default(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  status: z.enum(['active', 'draft']).default('draft'),
  images: z
    .array(z.string().url())
    .max(10, 'Maximum 10 images allowed')
    .optional(),
});

// Update product schema
export const updateProductSchema = z.object({
  name: productNameSchema.optional(),
  description: z.string().max(5000).optional(),
  sku: skuSchema.optional(),
  price: priceSchema.optional(),
  compareAtPrice: priceSchema.optional().nullable(),
  costPrice: priceSchema.optional().nullable(),
  stock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

// Product filter schema
export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  merchantId: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Inventory adjustment schema
export const inventoryAdjustmentSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  type: z.enum(['add', 'remove', 'set']),
  reason: z.string().max(200).optional(),
});

// Types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type InventoryAdjustmentInput = z.infer<
  typeof inventoryAdjustmentSchema
>;
