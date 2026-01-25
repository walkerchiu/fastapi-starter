import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  type ListUsersData,
  type CreateUserData,
  type UpdateUserData,
} from '@repo/api-client';
import {
  transformUser,
  transformPaginatedResponse,
  type ApiUserResponse,
  type ApiPaginatedResponse,
} from './transforms';

// Query key factory for users
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ListUsersData['query']) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Hook to fetch users list
export function useUsers(params?: ListUsersData['query']) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await listUsers({ query: params });
      if (response.error) {
        throw new Error('Failed to fetch users');
      }
      const apiResponse =
        response.data as ApiPaginatedResponse<ApiUserResponse>;
      return transformPaginatedResponse(apiResponse, transformUser);
    },
  });
}

// Hook to fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await getUser({ path: { id } });
      if (response.error) {
        throw new Error('Failed to fetch user');
      }
      return transformUser(response.data as ApiUserResponse);
    },
    enabled: !!id,
  });
}

// Hook to create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData['body']) => {
      const response = await createUser({ body: data });
      if (response.error) {
        throw new Error('Failed to create user');
      }
      return transformUser(response.data as ApiUserResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Hook to update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserData['body'];
    }) => {
      const response = await updateUser({
        path: { id },
        body: data,
      });
      if (response.error) {
        throw new Error('Failed to update user');
      }
      return transformUser(response.data as ApiUserResponse);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Hook to delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUser({ path: { id } });
      if (response.error) {
        throw new Error('Failed to delete user');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
