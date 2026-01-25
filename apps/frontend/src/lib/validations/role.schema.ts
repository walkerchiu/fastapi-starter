import { z } from 'zod';

// Role name validation
const roleNameSchema = z
  .string()
  .min(1, 'Role name is required')
  .max(50, 'Role name must be less than 50 characters');

// Role code validation (alphanumeric with underscores)
const roleCodeSchema = z
  .string()
  .min(1, 'Role code is required')
  .max(50, 'Role code must be less than 50 characters')
  .regex(
    /^[a-z][a-z0-9_]*$/,
    'Role code must start with a letter and contain only lowercase letters, numbers, and underscores',
  );

// Role description validation
const roleDescriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters')
  .optional();

// Create role schema
export const createRoleSchema = z.object({
  name: roleNameSchema,
  code: roleCodeSchema,
  description: roleDescriptionSchema,
  permissionIds: z.array(z.string()).optional(),
});

// Update role schema
export const updateRoleSchema = z.object({
  name: roleNameSchema.optional(),
  description: roleDescriptionSchema,
  permissionIds: z.array(z.string()).optional(),
});

// Role permissions update schema
export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string()),
});

// Role filter/search schema
export const roleFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Types
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>;
export type RoleFilterInput = z.infer<typeof roleFilterSchema>;
