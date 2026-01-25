import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  developerId: string;
  appId?: string;
  appName?: string;
  scopes: string[];
  status: 'active' | 'revoked';
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface ApiKeyListResponse {
  data: ApiKey[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiKeyQueryParams {
  page?: number;
  limit?: number;
  developerId?: string;
  appId?: string;
  status?: ApiKey['status'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateApiKeyInput {
  name: string;
  appId?: string;
  scopes?: string[];
  expiresAt?: string;
}

// Query key factory
export const apiKeyKeys = {
  all: ['api-keys'] as const,
  lists: () => [...apiKeyKeys.all, 'list'] as const,
  list: (params?: ApiKeyQueryParams) =>
    [...apiKeyKeys.lists(), params] as const,
  details: () => [...apiKeyKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiKeyKeys.details(), id] as const,
};

// API functions (placeholder)
const apiClient = {
  async getApiKeys(params?: ApiKeyQueryParams): Promise<ApiKeyListResponse> {
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
  async getApiKey(_id: string): Promise<ApiKey> {
    throw new Error('Not implemented');
  },
  async createApiKey(
    _data: CreateApiKeyInput,
  ): Promise<ApiKey & { key: string }> {
    throw new Error('Not implemented');
  },
  async revokeApiKey(_id: string): Promise<void> {
    throw new Error('Not implemented');
  },
};

// Hook to fetch API keys list
export function useApiKeys(params?: ApiKeyQueryParams) {
  return useQuery({
    queryKey: apiKeyKeys.list(params),
    queryFn: () => apiClient.getApiKeys(params),
  });
}

// Hook to fetch single API key
export function useApiKey(id: string) {
  return useQuery({
    queryKey: apiKeyKeys.detail(id),
    queryFn: () => apiClient.getApiKey(id),
    enabled: !!id,
  });
}

// Hook to create API key
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyInput) => apiClient.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
    },
  });
}

// Hook to revoke API key
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.revokeApiKey(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
    },
  });
}
