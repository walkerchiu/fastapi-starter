import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category:
    | 'system'
    | 'order'
    | 'payment'
    | 'promotion'
    | 'security'
    | 'message';
  title: string;
  content: string;
  link?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  category?: Notification['category'];
  isRead?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    categories: Notification['category'][];
  };
  push: {
    enabled: boolean;
    categories: Notification['category'][];
  };
  inApp: {
    enabled: boolean;
    categories: Notification['category'][];
  };
}

// Query key factory
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: NotificationQueryParams) =>
    [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

// API functions (placeholder)
const apiClient = {
  async getNotifications(
    params?: NotificationQueryParams,
  ): Promise<NotificationListResponse> {
    return {
      data: [],
      meta: {
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0,
        unreadCount: 0,
      },
    };
  },
  async getUnreadCount(): Promise<{ count: number }> {
    return { count: 0 };
  },
  async markAsRead(_id: string): Promise<void> {
    throw new Error('Not implemented');
  },
  async markAllAsRead(): Promise<void> {
    throw new Error('Not implemented');
  },
  async deleteNotification(_id: string): Promise<void> {
    throw new Error('Not implemented');
  },
  async deleteAllNotifications(): Promise<void> {
    throw new Error('Not implemented');
  },
  async getPreferences(): Promise<NotificationPreferences> {
    return {
      email: { enabled: true, categories: [] },
      push: { enabled: true, categories: [] },
      inApp: { enabled: true, categories: [] },
    };
  },
  async updatePreferences(
    _data: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    throw new Error('Not implemented');
  },
};

// Hook to fetch notifications list
export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => apiClient.getNotifications(params),
  });
}

// Hook to fetch unread count
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => apiClient.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Hook to mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

// Hook to mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

// Hook to delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

// Hook to delete all notifications
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

// Hook to fetch notification preferences
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => apiClient.getPreferences(),
  });
}

// Hook to update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationPreferences) =>
      apiClient.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
  });
}
