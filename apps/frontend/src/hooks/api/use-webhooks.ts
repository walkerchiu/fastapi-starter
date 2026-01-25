import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed';
  responseStatus?: number;
  responseBody?: string;
  attempts: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface Webhook {
  id: string;
  url: string;
  developerId: string;
  appId?: string;
  appName?: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  lastDeliveryAt?: string;
  lastDeliveryStatus?: 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface WebhookListResponse {
  data: Webhook[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WebhookDeliveryListResponse {
  data: WebhookDelivery[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WebhookQueryParams {
  page?: number;
  limit?: number;
  developerId?: string;
  appId?: string;
  status?: Webhook['status'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateWebhookInput {
  url: string;
  appId?: string;
  events: string[];
}

export interface UpdateWebhookInput {
  url?: string;
  events?: string[];
  status?: Webhook['status'];
}

// Available webhook events
export const WEBHOOK_EVENTS = [
  'order.created',
  'order.updated',
  'order.cancelled',
  'order.paid',
  'order.shipped',
  'order.delivered',
  'product.created',
  'product.updated',
  'product.deleted',
  'customer.created',
  'customer.updated',
  'refund.created',
  'refund.completed',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

// Query key factory
export const webhookKeys = {
  all: ['webhooks'] as const,
  lists: () => [...webhookKeys.all, 'list'] as const,
  list: (params?: WebhookQueryParams) =>
    [...webhookKeys.lists(), params] as const,
  details: () => [...webhookKeys.all, 'detail'] as const,
  detail: (id: string) => [...webhookKeys.details(), id] as const,
  deliveries: (id: string) =>
    [...webhookKeys.detail(id), 'deliveries'] as const,
};

// API functions (placeholder)
const apiClient = {
  async getWebhooks(params?: WebhookQueryParams): Promise<WebhookListResponse> {
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
  async getWebhook(_id: string): Promise<Webhook> {
    throw new Error('Not implemented');
  },
  async createWebhook(_data: CreateWebhookInput): Promise<Webhook> {
    throw new Error('Not implemented');
  },
  async updateWebhook(
    _id: string,
    _data: UpdateWebhookInput,
  ): Promise<Webhook> {
    throw new Error('Not implemented');
  },
  async deleteWebhook(_id: string): Promise<void> {
    throw new Error('Not implemented');
  },
  async regenerateSecret(_id: string): Promise<{ secret: string }> {
    throw new Error('Not implemented');
  },
  async getDeliveries(
    id: string,
    params?: { page?: number; limit?: number },
  ): Promise<WebhookDeliveryListResponse> {
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
  async retryDelivery(_webhookId: string, _deliveryId: string): Promise<void> {
    throw new Error('Not implemented');
  },
};

// Hook to fetch webhooks list
export function useWebhooks(params?: WebhookQueryParams) {
  return useQuery({
    queryKey: webhookKeys.list(params),
    queryFn: () => apiClient.getWebhooks(params),
  });
}

// Hook to fetch single webhook
export function useWebhook(id: string) {
  return useQuery({
    queryKey: webhookKeys.detail(id),
    queryFn: () => apiClient.getWebhook(id),
    enabled: !!id,
  });
}

// Hook to create webhook
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookInput) => apiClient.createWebhook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

// Hook to update webhook
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookInput }) =>
      apiClient.updateWebhook(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: webhookKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

// Hook to delete webhook
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteWebhook(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

// Hook to regenerate webhook secret
export function useRegenerateWebhookSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.regenerateSecret(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.detail(id) });
    },
  });
}

// Hook to fetch webhook deliveries
export function useWebhookDeliveries(
  id: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: webhookKeys.deliveries(id),
    queryFn: () => apiClient.getDeliveries(id, params),
    enabled: !!id,
  });
}

// Hook to retry webhook delivery
export function useRetryWebhookDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      webhookId,
      deliveryId,
    }: {
      webhookId: string;
      deliveryId: string;
    }) => apiClient.retryDelivery(webhookId, deliveryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: webhookKeys.deliveries(variables.webhookId),
      });
    },
  });
}
