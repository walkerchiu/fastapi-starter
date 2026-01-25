import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive' | 'blocked';
  tier?: 'regular' | 'silver' | 'gold' | 'platinum';
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  addresses?: CustomerAddress[];
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Customer['status'];
  tier?: Customer['tier'];
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: Customer['status'];
  tier?: Customer['tier'];
  notes?: string;
  tags?: string[];
}

// Query key factory
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: CustomerQueryParams) =>
    [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  orders: (id: string) => [...customerKeys.detail(id), 'orders'] as const,
};

// API functions (placeholder)
const apiClient = {
  async getCustomers(
    params?: CustomerQueryParams,
  ): Promise<CustomerListResponse> {
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
  async getCustomer(_id: string): Promise<Customer> {
    throw new Error('Not implemented');
  },
  async createCustomer(_data: CreateCustomerInput): Promise<Customer> {
    throw new Error('Not implemented');
  },
  async updateCustomer(
    _id: string,
    _data: UpdateCustomerInput,
  ): Promise<Customer> {
    throw new Error('Not implemented');
  },
  async deleteCustomer(_id: string): Promise<void> {
    throw new Error('Not implemented');
  },
};

// Hook to fetch customers list
export function useCustomers(params?: CustomerQueryParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => apiClient.getCustomers(params),
  });
}

// Hook to fetch single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => apiClient.getCustomer(id),
    enabled: !!id,
  });
}

// Hook to create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerInput) => apiClient.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// Hook to update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) =>
      apiClient.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// Hook to delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCustomer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
