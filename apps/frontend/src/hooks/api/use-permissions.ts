import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  type ListPermissionsData,
  type CreatePermissionData,
  type UpdatePermissionData,
  type PermissionResponse,
  type PaginatedPermissions,
} from '@repo/api-client';

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
export interface PaginatedPermissionItems {
  data: Permission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Transform API response to frontend format
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

// Transform paginated response
function transformPaginatedPermissions(
  response: PaginatedPermissions,
): PaginatedPermissionItems {
  return {
    data: response.items.map(transformPermission),
    meta: {
      total: response.total,
      page: 1,
      limit: response.items.length,
      hasMore: response.has_more,
    },
  };
}

// Query key factory for permissions
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (params?: ListPermissionsData['query']) =>
    [...permissionKeys.lists(), params] as const,
  details: () => [...permissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...permissionKeys.details(), id] as const,
};

// Hook to fetch permissions list
export function usePermissions(params?: ListPermissionsData['query']) {
  return useQuery<PaginatedPermissionItems | null, Error>({
    queryKey: permissionKeys.list(params),
    queryFn: async (): Promise<PaginatedPermissionItems | null> => {
      const response = await listPermissions({ query: params });
      if (response.error) {
        throw new Error('Failed to fetch permissions');
      }
      return response.data
        ? transformPaginatedPermissions(response.data)
        : null;
    },
  });
}

// Hook to fetch single permission
export function usePermission(id: string) {
  return useQuery<Permission | null, Error>({
    queryKey: permissionKeys.detail(id),
    queryFn: async (): Promise<Permission | null> => {
      const response = await getPermission({ path: { id: Number(id) } });
      if (response.error) {
        throw new Error('Failed to fetch permission');
      }
      return response.data ? transformPermission(response.data) : null;
    },
    enabled: !!id,
  });
}

// Hook to create permission
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePermissionData['body']) => {
      const response = await createPermission({ body: data });
      if (response.error) {
        throw new Error('Failed to create permission');
      }
      return response.data ? transformPermission(response.data) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
}

// Hook to update permission
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePermissionData['body'];
    }) => {
      const response = await updatePermission({
        path: { id: Number(id) },
        body: data,
      });
      if (response.error) {
        throw new Error('Failed to update permission');
      }
      return response.data ? transformPermission(response.data) : null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
}

// Hook to delete permission
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePermission({ path: { id: Number(id) } });
      if (response.error) {
        throw new Error('Failed to delete permission');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
}
