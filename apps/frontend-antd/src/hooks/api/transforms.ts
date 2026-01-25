/**
 * Transform utilities for converting snake_case API responses to camelCase frontend types.
 * FastAPI backend uses snake_case in REST API responses.
 */

// API response types (snake_case - matching REST API output)
export interface ApiUserResponse {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_two_factor_enabled: boolean;
  roles?: ApiRoleResponse[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ApiRoleResponse {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  permissions?: ApiPermissionResponse[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ApiPermissionResponse {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ApiFileResponse {
  id: string;
  key: string;
  filename: string;
  content_type: string;
  size: number;
  bucket: string;
  user_id: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ApiAuditLogResponse {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ApiScheduledTaskResponse {
  id: string;
  name: string;
  description?: string;
  cron_expression: string;
  enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiPaginatedResponse<T> {
  items: T[];
  total: number;
  has_more: boolean;
}

// Frontend types (camelCase)
import type {
  User,
  Role,
  Permission,
  File,
  AuditLog,
  ScheduledTask,
  PaginatedResponse,
} from './types';

// Transform functions
export function transformUser(user: ApiUserResponse): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.is_active,
    isEmailVerified: user.is_email_verified,
    isTwoFactorEnabled: user.is_two_factor_enabled,
    roles: user.roles?.map(transformRole),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,
  };
}

export function transformRole(role: ApiRoleResponse): Role {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    isSystem: role.is_system,
    permissions: role.permissions?.map(transformPermission),
    createdAt: role.created_at,
    updatedAt: role.updated_at,
    deletedAt: role.deleted_at,
  };
}

export function transformPermission(
  permission: ApiPermissionResponse,
): Permission {
  return {
    id: permission.id,
    code: permission.code,
    name: permission.name,
    description: permission.description,
    resource: permission.resource,
    action: permission.action,
    createdAt: permission.created_at,
    updatedAt: permission.updated_at,
    deletedAt: permission.deleted_at,
  };
}

export function transformFile(file: ApiFileResponse): File {
  // Generate URL for file access (adjust based on your S3/storage configuration)
  const fileUrl = `/api/v1/files/${file.id}/download`;

  return {
    id: file.id,
    key: file.key,
    filename: file.filename,
    contentType: file.content_type,
    size: file.size,
    bucket: file.bucket,
    userId: file.user_id,
    metadata: file.metadata,
    createdAt: file.created_at,
    updatedAt: file.updated_at,
    deletedAt: file.deleted_at,
    // Compatibility fields for UI components
    originalName: file.filename,
    mimeType: file.content_type,
    url: fileUrl,
    description: (file.metadata?.['description'] as string) ?? null,
    thumbnailUrl: file.content_type.startsWith('image/') ? fileUrl : undefined,
  };
}

export function transformAuditLog(log: ApiAuditLogResponse): AuditLog {
  return {
    id: log.id,
    userId: log.user_id,
    action: log.action,
    resource: log.resource,
    resourceId: log.resource_id,
    details: log.details,
    ipAddress: log.ip_address,
    userAgent: log.user_agent,
    createdAt: log.created_at,
  };
}

export function transformScheduledTask(
  task: ApiScheduledTaskResponse,
): ScheduledTask {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    cronExpression: task.cron_expression,
    enabled: task.enabled,
    lastRunAt: task.last_run_at,
    nextRunAt: task.next_run_at,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

export function transformPaginatedResponse<TApi, TFrontend>(
  response: ApiPaginatedResponse<TApi>,
  transformFn: (item: TApi) => TFrontend,
): PaginatedResponse<TFrontend> {
  return {
    data: response.items.map(transformFn),
    meta: {
      total: response.total,
      page: 1,
      limit: response.items.length,
      totalPages: Math.ceil(response.total / response.items.length) || 1,
    },
  };
}
