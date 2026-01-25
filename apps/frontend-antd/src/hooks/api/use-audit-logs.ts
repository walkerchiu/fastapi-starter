import { useQuery } from '@tanstack/react-query';

// Audit log types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  skip?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Query key factory for audit logs
export const auditLogKeys = {
  all: ['auditLogs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (params?: AuditLogQueryParams) =>
    [...auditLogKeys.lists(), params] as const,
  details: () => [...auditLogKeys.all, 'detail'] as const,
  detail: (id: string) => [...auditLogKeys.details(), id] as const,
};

// Mock data for audit logs (to be replaced with actual API call when available)
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    action: 'CREATE',
    resource: 'USER',
    resourceId: 'user-2',
    details: { email: 'newuser@example.com' },
    ipAddress: '192.168.1.1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    userName: 'John Doe',
    action: 'UPDATE',
    resource: 'ROLE',
    resourceId: 'role-1',
    details: { name: 'Admin' },
    ipAddress: '192.168.1.1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    userId: 'user-2',
    userName: 'Jane Smith',
    action: 'DELETE',
    resource: 'FILE',
    resourceId: 'file-1',
    ipAddress: '192.168.1.2',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Hook to fetch audit logs list
export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: async (): Promise<AuditLogListResponse> => {
      // TODO: Replace with actual API call when audit log endpoint is available
      // const response = await getAuditLogs({ query: params });
      // if (response.error) {
      //   throw new Error('Failed to fetch audit logs');
      // }
      // return response.data;

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredLogs = [...mockAuditLogs];

      if (params?.userId) {
        filteredLogs = filteredLogs.filter(
          (log) => log.userId === params.userId,
        );
      }
      if (params?.action) {
        filteredLogs = filteredLogs.filter(
          (log) => log.action === params.action,
        );
      }
      if (params?.resource) {
        filteredLogs = filteredLogs.filter(
          (log) => log.resource === params.resource,
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);

      return {
        data: paginatedLogs,
        meta: {
          total: filteredLogs.length,
          page,
          limit,
          totalPages: Math.ceil(filteredLogs.length / limit),
        },
      };
    },
  });
}

// Hook to fetch single audit log
export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: async (): Promise<AuditLog> => {
      // TODO: Replace with actual API call when audit log endpoint is available
      // const response = await getAuditLog({ path: { id } });
      // if (response.error) {
      //   throw new Error('Failed to fetch audit log');
      // }
      // return response.data;

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 300));

      const log = mockAuditLogs.find((l) => l.id === id);
      if (!log) {
        throw new Error('Audit log not found');
      }
      return log;
    },
    enabled: !!id,
  });
}
