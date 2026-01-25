import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  categoryId?: string;
  categoryName?: string;
  status: 'active' | 'draft' | 'archived';
  images: string[];
  thumbnailUrl?: string;
  merchantId: string;
  merchantName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  merchantId?: string;
  status?: 'active' | 'draft' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductInput {
  name: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  categoryId?: string;
  status?: 'active' | 'draft';
  images?: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  categoryId?: string;
  status?: 'active' | 'draft' | 'archived';
  images?: string[];
}

// Query key factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductQueryParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// API functions (placeholder - replace with actual API client)
const apiClient = {
  async getProducts(params?: ProductQueryParams): Promise<ProductListResponse> {
    // TODO: Replace with actual API call
    // const response = await productsControllerFindAll({ query: params });
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
  async getProduct(_id: string): Promise<Product> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
  async createProduct(_data: CreateProductInput): Promise<Product> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
  async updateProduct(
    _id: string,
    _data: UpdateProductInput,
  ): Promise<Product> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
  async deleteProduct(_id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
};

// Hook to fetch products list
export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => apiClient.getProducts(params),
  });
}

// Hook to fetch single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  });
}

// Hook to create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook to update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      apiClient.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook to delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
