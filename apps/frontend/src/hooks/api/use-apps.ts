import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface App {
  id: string;
  name: string;
  description?: string;
  developerId: string;
  developerName: string;
  clientId: string;
  redirectUris: string[];
  scopes: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  type: 'web' | 'mobile' | 'server';
  logoUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface AppListResponse {
  data: App[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AppQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  developerId?: string;
  status?: App['status'];
  type?: App['type'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAppInput {
  name: string;
  description?: string;
  redirectUris: string[];
  scopes?: string[];
  type: App['type'];
  logoUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export interface UpdateAppInput {
  name?: string;
  description?: string;
  redirectUris?: string[];
  scopes?: string[];
  logoUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

// Query key factory
export const appKeys = {
  all: ['apps'] as const,
  lists: () => [...appKeys.all, 'list'] as const,
  list: (params?: AppQueryParams) => [...appKeys.lists(), params] as const,
  details: () => [...appKeys.all, 'detail'] as const,
  detail: (id: string) => [...appKeys.details(), id] as const,
};

// API functions (placeholder)
const apiClient = {
  async getApps(params?: AppQueryParams): Promise<AppListResponse> {
    return {
      data: [],
      meta: {
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0,
      },
    };
  },
  async getApp(_id: string): Promise<App> {
    throw new Error('Not implemented');
  },
  async createApp(
    _data: CreateAppInput,
  ): Promise<App & { clientSecret: string }> {
    throw new Error('Not implemented');
  },
  async updateApp(_id: string, _data: UpdateAppInput): Promise<App> {
    throw new Error('Not implemented');
  },
  async deleteApp(_id: string): Promise<void> {
    throw new Error('Not implemented');
  },
  async regenerateSecret(_id: string): Promise<{ clientSecret: string }> {
    throw new Error('Not implemented');
  },
};

// Hook to fetch apps list
export function useApps(params?: AppQueryParams) {
  return useQuery({
    queryKey: appKeys.list(params),
    queryFn: () => apiClient.getApps(params),
  });
}

// Hook to fetch single app
export function useApp(id: string) {
  return useQuery({
    queryKey: appKeys.detail(id),
    queryFn: () => apiClient.getApp(id),
    enabled: !!id,
  });
}

// Hook to create app
export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppInput) => apiClient.createApp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appKeys.lists() });
    },
  });
}

// Hook to update app
export function useUpdateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppInput }) =>
      apiClient.updateApp(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appKeys.lists() });
    },
  });
}

// Hook to delete app
export function useDeleteApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteApp(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appKeys.lists() });
    },
  });
}

// Hook to regenerate app secret
export function useRegenerateAppSecret() {
  return useMutation({
    mutationFn: (id: string) => apiClient.regenerateSecret(id),
  });
}
