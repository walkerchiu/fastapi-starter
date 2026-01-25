import { useQuery } from '@tanstack/react-query';

// Types
export interface Commission {
  id: string;
  agentId: string;
  agentName: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  level: number;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface CommissionSummary {
  totalEarnings: number;
  pendingAmount: number;
  paidAmount: number;
  withdrawableAmount: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  totalOrders: number;
  conversionRate: number;
}

export interface CommissionListResponse {
  data: Commission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CommissionQueryParams {
  page?: number;
  limit?: number;
  agentId?: string;
  status?: Commission['status'];
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Query key factory
export const commissionKeys = {
  all: ['commissions'] as const,
  lists: () => [...commissionKeys.all, 'list'] as const,
  list: (params?: CommissionQueryParams) =>
    [...commissionKeys.lists(), params] as const,
  summary: (agentId?: string) =>
    [...commissionKeys.all, 'summary', agentId] as const,
  details: () => [...commissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...commissionKeys.details(), id] as const,
};

// API functions (placeholder)
const apiClient = {
  async getCommissions(
    params?: CommissionQueryParams,
  ): Promise<CommissionListResponse> {
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
  async getCommission(_id: string): Promise<Commission> {
    throw new Error('Not implemented');
  },
  async getCommissionSummary(_agentId?: string): Promise<CommissionSummary> {
    return {
      totalEarnings: 0,
      pendingAmount: 0,
      paidAmount: 0,
      withdrawableAmount: 0,
      thisMonthEarnings: 0,
      lastMonthEarnings: 0,
      totalOrders: 0,
      conversionRate: 0,
    };
  },
};

// Hook to fetch commissions list
export function useCommissions(params?: CommissionQueryParams) {
  return useQuery({
    queryKey: commissionKeys.list(params),
    queryFn: () => apiClient.getCommissions(params),
  });
}

// Hook to fetch single commission
export function useCommission(id: string) {
  return useQuery({
    queryKey: commissionKeys.detail(id),
    queryFn: () => apiClient.getCommission(id),
    enabled: !!id,
  });
}

// Hook to fetch commission summary
export function useCommissionSummary(agentId?: string) {
  return useQuery({
    queryKey: commissionKeys.summary(agentId),
    queryFn: () => apiClient.getCommissionSummary(agentId),
  });
}
