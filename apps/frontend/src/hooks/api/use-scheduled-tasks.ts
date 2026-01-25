import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface ScheduledTask {
  id: string;
  name: string;
  description?: string | null;
  task_type: string;
  cron_expression?: string | null;
  scheduled_at?: string | null;
  timezone: string;
  is_active: boolean;
  context?: Record<string, unknown> | null;
  last_run_at?: string | null;
  next_run_at?: string | null;
  created_by_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskExecution {
  id: string;
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  result?: Record<string, unknown> | null;
  created_at: string;
}

export interface TaskTypeInfo {
  type: string;
  name: string;
  description?: string;
}

export interface ScheduledTaskListResponse {
  data: ScheduledTask[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskExecutionListResponse {
  data: TaskExecution[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ScheduledTaskQueryParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface CreateScheduledTaskInput {
  name: string;
  description?: string;
  task_type: string;
  cron_expression?: string;
  timezone?: string;
  context?: Record<string, unknown> | null;
  is_active?: boolean;
}

export interface UpdateScheduledTaskInput {
  name?: string;
  description?: string;
  cron_expression?: string;
  timezone?: string;
  context?: Record<string, unknown> | null;
}

// Query key factory
export const scheduledTaskKeys = {
  all: ['scheduled-tasks'] as const,
  lists: () => [...scheduledTaskKeys.all, 'list'] as const,
  list: (params?: ScheduledTaskQueryParams) =>
    [...scheduledTaskKeys.lists(), params] as const,
  details: () => [...scheduledTaskKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduledTaskKeys.details(), id] as const,
  executions: (id: string, params?: { page?: number; limit?: number }) =>
    [...scheduledTaskKeys.detail(id), 'executions', params] as const,
  types: () => [...scheduledTaskKeys.all, 'types'] as const,
};

// API functions (placeholder - replace with actual API client when available)
const apiClient = {
  async getScheduledTasks(
    params?: ScheduledTaskQueryParams,
  ): Promise<ScheduledTaskListResponse> {
    // TODO: Replace with actual API call
    // const response = await scheduledTasksControllerFindAll({ query: params });
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
  async getScheduledTask(id: string): Promise<ScheduledTask> {
    // TODO: Replace with actual API call
    void id;
    throw new Error('Not implemented');
  },
  async getTaskTypes(): Promise<TaskTypeInfo[]> {
    // TODO: Replace with actual API call
    return [
      {
        type: 'email_digest',
        name: 'Email Digest',
        description: 'Send daily/weekly email digests',
      },
      {
        type: 'data_cleanup',
        name: 'Data Cleanup',
        description: 'Clean up old or unused data',
      },
      {
        type: 'report_generation',
        name: 'Report Generation',
        description: 'Generate scheduled reports',
      },
      {
        type: 'cache_refresh',
        name: 'Cache Refresh',
        description: 'Refresh cached data',
      },
    ];
  },
  async getTaskExecutions(
    taskId: string,
    params?: { page?: number; limit?: number },
  ): Promise<TaskExecutionListResponse> {
    // TODO: Replace with actual API call
    void taskId;
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
  async createScheduledTask(
    data: CreateScheduledTaskInput,
  ): Promise<ScheduledTask> {
    // TODO: Replace with actual API call
    void data;
    throw new Error('Not implemented');
  },
  async updateScheduledTask(
    id: string,
    data: UpdateScheduledTaskInput,
  ): Promise<ScheduledTask> {
    // TODO: Replace with actual API call
    void id;
    void data;
    throw new Error('Not implemented');
  },
  async deleteScheduledTask(id: string): Promise<void> {
    // TODO: Replace with actual API call
    void id;
    throw new Error('Not implemented');
  },
  async enableScheduledTask(id: string): Promise<ScheduledTask> {
    // TODO: Replace with actual API call
    void id;
    throw new Error('Not implemented');
  },
  async disableScheduledTask(id: string): Promise<ScheduledTask> {
    // TODO: Replace with actual API call
    void id;
    throw new Error('Not implemented');
  },
  async triggerScheduledTask(id: string): Promise<TaskExecution> {
    // TODO: Replace with actual API call
    void id;
    throw new Error('Not implemented');
  },
};

// Hook to fetch scheduled tasks list
export function useScheduledTasks(params?: ScheduledTaskQueryParams) {
  return useQuery({
    queryKey: scheduledTaskKeys.list(params),
    queryFn: () => apiClient.getScheduledTasks(params),
  });
}

// Hook to fetch single scheduled task
export function useScheduledTask(id: string) {
  return useQuery({
    queryKey: scheduledTaskKeys.detail(id),
    queryFn: () => apiClient.getScheduledTask(id),
    enabled: !!id,
  });
}

// Hook to fetch task types
export function useTaskTypes() {
  return useQuery({
    queryKey: scheduledTaskKeys.types(),
    queryFn: () => apiClient.getTaskTypes(),
  });
}

// Hook to fetch task executions
export function useTaskExecutions(
  taskId: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: scheduledTaskKeys.executions(taskId, params),
    queryFn: () => apiClient.getTaskExecutions(taskId, params),
    enabled: !!taskId,
  });
}

// Hook to create scheduled task
export function useCreateScheduledTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduledTaskInput) =>
      apiClient.createScheduledTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.lists() });
    },
  });
}

// Hook to update scheduled task
export function useUpdateScheduledTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduledTaskInput;
    }) => apiClient.updateScheduledTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduledTaskKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.lists() });
    },
  });
}

// Hook to delete scheduled task
export function useDeleteScheduledTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteScheduledTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.lists() });
    },
  });
}

// Hook to enable scheduled task
export function useEnableScheduledTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.enableScheduledTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.lists() });
    },
  });
}

// Hook to disable scheduled task
export function useDisableScheduledTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.disableScheduledTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.lists() });
    },
  });
}

// Hook to trigger scheduled task
export function useTriggerScheduledTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.triggerScheduledTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: scheduledTaskKeys.executions(id, {}),
      });
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.detail(id) });
    },
  });
}
