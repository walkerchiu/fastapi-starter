import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'support' | 'system';
  content: string;
  attachments?: string[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assigneeId?: string;
  assigneeName?: string;
  subject: string;
  category:
    | 'general'
    | 'order'
    | 'payment'
    | 'refund'
    | 'shipping'
    | 'product'
    | 'account'
    | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  orderId?: string;
  orderNumber?: string;
  messages: TicketMessage[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface TicketListResponse {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  assigneeId?: string;
  category?: Ticket['category'];
  priority?: Ticket['priority'];
  status?: Ticket['status'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketInput {
  customerId: string;
  subject: string;
  category: Ticket['category'];
  priority?: Ticket['priority'];
  content: string;
  orderId?: string;
  attachments?: string[];
}

export interface ReplyTicketInput {
  content: string;
  attachments?: string[];
}

export interface UpdateTicketInput {
  assigneeId?: string;
  priority?: Ticket['priority'];
  status?: Ticket['status'];
  tags?: string[];
}

// Query key factory
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params?: TicketQueryParams) =>
    [...ticketKeys.lists(), params] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
};

// API functions (placeholder)
const apiClient = {
  async getTickets(params?: TicketQueryParams): Promise<TicketListResponse> {
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
  async getTicket(_id: string): Promise<Ticket> {
    throw new Error('Not implemented');
  },
  async createTicket(_data: CreateTicketInput): Promise<Ticket> {
    throw new Error('Not implemented');
  },
  async replyTicket(
    _id: string,
    _data: ReplyTicketInput,
  ): Promise<TicketMessage> {
    throw new Error('Not implemented');
  },
  async updateTicket(_id: string, _data: UpdateTicketInput): Promise<Ticket> {
    throw new Error('Not implemented');
  },
  async closeTicket(_id: string): Promise<Ticket> {
    throw new Error('Not implemented');
  },
};

// Hook to fetch tickets list
export function useTickets(params?: TicketQueryParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => apiClient.getTickets(params),
  });
}

// Hook to fetch single ticket
export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => apiClient.getTicket(id),
    enabled: !!id,
  });
}

// Hook to create ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketInput) => apiClient.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

// Hook to reply to ticket
export function useReplyTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReplyTicketInput }) =>
      apiClient.replyTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(variables.id),
      });
    },
  });
}

// Hook to update ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      apiClient.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

// Hook to close ticket
export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.closeTicket(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}
