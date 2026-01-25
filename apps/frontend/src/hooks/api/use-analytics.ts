import { useQuery } from '@tanstack/react-query';

// Types
export interface AnalyticsOverview {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    total: number;
    newThisMonth: number;
    change: number;
  };
  averageOrderValue: {
    value: number;
    change: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  thumbnailUrl?: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  avatarUrl?: string;
}

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  merchantId?: string;
  granularity?: 'day' | 'week' | 'month';
}

// Query key factory
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (params?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, 'overview', params] as const,
  revenue: (params?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, 'revenue', params] as const,
  orders: (params?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, 'orders', params] as const,
  traffic: (params?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, 'traffic', params] as const,
  topProducts: (params?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, 'top-products', params] as const,
  topCustomers: (params?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, 'top-customers', params] as const,
  categories: (params?: AnalyticsQueryParams) =>
    [...analyticsKeys.all, 'categories', params] as const,
};

// API functions (placeholder)
const apiClient = {
  async getOverview(
    _params?: AnalyticsQueryParams,
  ): Promise<AnalyticsOverview> {
    return {
      revenue: { total: 0, change: 0, trend: 'stable' },
      orders: { total: 0, change: 0, trend: 'stable' },
      customers: { total: 0, newThisMonth: 0, change: 0 },
      averageOrderValue: { value: 0, change: 0 },
    };
  },
  async getRevenueTimeSeries(
    _params?: AnalyticsQueryParams,
  ): Promise<TimeSeriesData[]> {
    return [];
  },
  async getOrdersTimeSeries(
    _params?: AnalyticsQueryParams,
  ): Promise<TimeSeriesData[]> {
    return [];
  },
  async getTrafficTimeSeries(
    _params?: AnalyticsQueryParams,
  ): Promise<TimeSeriesData[]> {
    return [];
  },
  async getTopProducts(
    _params?: AnalyticsQueryParams & { limit?: number },
  ): Promise<TopProduct[]> {
    return [];
  },
  async getTopCustomers(
    _params?: AnalyticsQueryParams & { limit?: number },
  ): Promise<TopCustomer[]> {
    return [];
  },
  async getCategoryBreakdown(
    _params?: AnalyticsQueryParams,
  ): Promise<CategoryData[]> {
    return [];
  },
};

// Hook to fetch analytics overview
export function useAnalyticsOverview(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => apiClient.getOverview(params),
  });
}

// Hook to fetch revenue time series
export function useRevenueAnalytics(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => apiClient.getRevenueTimeSeries(params),
  });
}

// Hook to fetch orders time series
export function useOrdersAnalytics(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.orders(params),
    queryFn: () => apiClient.getOrdersTimeSeries(params),
  });
}

// Hook to fetch traffic time series
export function useTrafficAnalytics(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.traffic(params),
    queryFn: () => apiClient.getTrafficTimeSeries(params),
  });
}

// Hook to fetch top products
export function useTopProducts(
  params?: AnalyticsQueryParams & { limit?: number },
) {
  return useQuery({
    queryKey: analyticsKeys.topProducts(params),
    queryFn: () => apiClient.getTopProducts(params),
  });
}

// Hook to fetch top customers
export function useTopCustomers(
  params?: AnalyticsQueryParams & { limit?: number },
) {
  return useQuery({
    queryKey: analyticsKeys.topCustomers(params),
    queryFn: () => apiClient.getTopCustomers(params),
  });
}

// Hook to fetch category breakdown
export function useCategoryAnalytics(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.categories(params),
    queryFn: () => apiClient.getCategoryBreakdown(params),
  });
}
