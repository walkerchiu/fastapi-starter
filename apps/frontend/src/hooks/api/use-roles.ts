import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  replaceRolePermissions,
  type ListRolesData,
  type CreateRoleData,
  type UpdateRoleData,
  type ReplaceRolePermissionsData,
  type RoleResponse,
  type PaginatedRoles,
  type PermissionResponse,
} from '@repo/api-client';

// Transformed role type for frontend use
export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// Transformed permission type for frontend use
export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

// Paginated response type
export interface PaginatedRoleItems {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Transform permission
function transformPermission(permission: PermissionResponse): Permission {
  return {
    id: permission.id,
    code: permission.code,
    name: permission.name,
    description: permission.description || '',
    resource: permission.resource || '',
    action: permission.action || '',
    createdAt: permission.created_at || '',
    updatedAt: permission.updated_at || '',
  };
}

// Transform API response to frontend format
function transformRole(role: RoleResponse): Role {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description || '',
    isSystem: role.is_system ?? false,
    permissions: (role.permissions ?? []).map(transformPermission),
    createdAt: role.created_at || '',
    updatedAt: role.updated_at || '',
  };
}

// Transform paginated response
function transformPaginatedRoles(response: PaginatedRoles): PaginatedRoleItems {
  return {
    data: response.items.map(transformRole),
    meta: {
      total: response.total,
      page: 1,
      limit: response.items.length,
      hasMore: response.has_more,
    },
  };
}

// Query key factory for roles
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: ListRolesData['query']) =>
    [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  permissions: (id: string) => [...roleKeys.detail(id), 'permissions'] as const,
};

// Hook to fetch roles list
export function useRoles(params?: ListRolesData['query']) {
  return useQuery<PaginatedRoleItems | null, Error>({
    queryKey: roleKeys.list(params),
    queryFn: async (): Promise<PaginatedRoleItems | null> => {
      const response = await listRoles({ query: params });
      if (response.error) {
        throw new Error('Failed to fetch roles');
      }
      return response.data ? transformPaginatedRoles(response.data) : null;
    },
  });
}

// Hook to fetch single role
export function useRole(id: string) {
  return useQuery<Role | null, Error>({
    queryKey: roleKeys.detail(id),
    queryFn: async (): Promise<Role | null> => {
      const response = await getRole({ path: { id: Number(id) } });
      if (response.error) {
        throw new Error('Failed to fetch role');
      }
      return response.data ? transformRole(response.data) : null;
    },
    enabled: !!id,
  });
}

// Hook to fetch role permissions
export function useRolePermissions(id: string) {
  return useQuery<Permission[], Error>({
    queryKey: roleKeys.permissions(id),
    queryFn: async (): Promise<Permission[]> => {
      const response = await getRolePermissions({ path: { id: Number(id) } });
      if (response.error) {
        throw new Error('Failed to fetch role permissions');
      }
      return response.data ? response.data.map(transformPermission) : [];
    },
    enabled: !!id,
  });
}

// Hook to create role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleData['body']) => {
      const response = await createRole({ body: data });
      if (response.error) {
        throw new Error('Failed to create role');
      }
      return response.data ? transformRole(response.data) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

// Hook to update role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRoleData['body'];
    }) => {
      const response = await updateRole({
        path: { id: Number(id) },
        body: data,
      });
      if (response.error) {
        throw new Error('Failed to update role');
      }
      return response.data ? transformRole(response.data) : null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

// Hook to delete role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteRole({ path: { id: Number(id) } });
      if (response.error) {
        throw new Error('Failed to delete role');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

// Input type for replacing role permissions (camelCase for frontend)
export interface ReplaceRolePermissionsInput {
  permissionIds: number[];
}

// Hook to replace role permissions
export function useReplaceRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ReplaceRolePermissionsInput;
    }) => {
      // Transform camelCase to snake_case for API
      const apiData: ReplaceRolePermissionsData['body'] = {
        permission_ids: data.permissionIds,
      };
      const response = await replaceRolePermissions({
        path: { id: Number(id) },
        body: apiData,
      });
      if (response.error) {
        throw new Error('Failed to replace role permissions');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.permissions(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: roleKeys.detail(variables.id),
      });
    },
  });
}
