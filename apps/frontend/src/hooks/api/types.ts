/**
 * Shared API types for admin pages.
 * These types match the backend entity structures.
 */

/**
 * User type matching the backend User entity.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  roles?: Role[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Role type matching the backend Role entity.
 */
export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Permission type matching the backend Permission entity.
 */
export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Common query parameters for list endpoints.
 */
export interface ListQueryParams {
  skip?: number;
  limit?: number;
}

/**
 * User list query parameters.
 */
export interface UserListParams extends ListQueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeRoles?: boolean;
}

/**
 * Role list query parameters.
 */
export interface RoleListParams extends ListQueryParams {
  includePermissions?: boolean;
}

/**
 * Permission list query parameters.
 */
export type PermissionListParams = ListQueryParams;

/**
 * File type matching the backend File entity.
 */
export interface File {
  id: string;
  key: string;
  filename: string;
  originalName: string;
  contentType: string;
  mimeType: string;
  size: number;
  bucket: string;
  userId: string;
  url: string;
  description?: string | null;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * File list query parameters.
 */
export type FileListParams = ListQueryParams;

/**
 * Audit log type.
 */
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * Audit log query parameters.
 */
export interface AuditLogQueryParams extends ListQueryParams {
  page?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Scheduled task type.
 */
export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Scheduled task query parameters.
 */
export interface ScheduledTaskQueryParams extends ListQueryParams {
  enabled?: boolean;
}
