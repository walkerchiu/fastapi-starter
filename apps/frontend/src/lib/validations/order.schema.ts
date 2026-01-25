import { z } from 'zod';

// Order status schema
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

// Payment status schema
export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded',
]);

// Address schema
const addressSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
});

// Order item schema
const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be a positive number'),
});

// Create order schema (for system use, not typically user-facing)
export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: addressSchema,
  notes: z.string().max(500).optional(),
  couponCode: z.string().max(50).optional(),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  notes: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
});

// Cancel order schema
export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
  refundAmount: z.number().min(0).optional(),
});

// Order filter schema
export const orderFilterSchema = z.object({
  search: z.string().optional(),
  customerId: z.string().optional(),
  merchantId: z.string().optional(),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minTotal: z.number().min(0).optional(),
  maxTotal: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Refund request schema
export const refundRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().min(1, 'Refund reason is required').max(500),
  amount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  items: z
    .array(
      z.object({
        orderItemId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .optional(),
});

// Types
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
