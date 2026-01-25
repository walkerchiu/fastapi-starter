import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  thumbnailUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  merchantId?: string;
  merchantName?: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  merchantId?: string;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateOrderStatusInput {
  status: Order['status'];
  notes?: string;
}

// Query key factory
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: OrderQueryParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// API functions (placeholder)
const apiClient = {
  async getOrders(params?: OrderQueryParams): Promise<OrderListResponse> {
    // TODO: Replace with actual API call
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
  async getOrder(_id: string): Promise<Order> {
    throw new Error('Not implemented');
  },
  async updateOrderStatus(
    _id: string,
    _data: UpdateOrderStatusInput,
  ): Promise<Order> {
    throw new Error('Not implemented');
  },
  async cancelOrder(_id: string, _reason?: string): Promise<Order> {
    throw new Error('Not implemented');
  },
};

// Hook to fetch orders list
export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => apiClient.getOrders(params),
  });
}

// Hook to fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id,
  });
}

// Hook to update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusInput }) =>
      apiClient.updateOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Hook to cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.cancelOrder(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
