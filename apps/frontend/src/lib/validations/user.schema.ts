import { z } from 'zod';

// Password validation rules
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation
const emailSchema = z.string().email('Invalid email format');

// Name validation
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters');

// Create user schema
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  roleIds: z.array(z.number()).min(1, 'At least one role is required'),
  isActive: z.boolean().default(true),
});

// Update user schema (all fields optional except those that cannot be changed)
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  roleIds: z.array(z.number()).min(1).optional(),
  isActive: z.boolean().optional(),
});

// User profile update schema (for self-update)
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// User filter/search schema
export const userFilterSchema = z.object({
  search: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
