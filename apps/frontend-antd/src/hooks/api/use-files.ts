import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listFiles,
  getFile,
  uploadFile,
  deleteFile,
  type ListFilesData,
} from '@repo/api-client';

// Query key factory for files
export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (params?: ListFilesData['query']) =>
    [...fileKeys.lists(), params] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: string) => [...fileKeys.details(), id] as const,
};

// Hook to fetch files list
export function useFiles(params?: ListFilesData['query']) {
  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: async () => {
      const response = await listFiles({ query: params });
      if (response.error) {
        throw new Error('Failed to fetch files');
      }
      return response.data;
    },
  });
}

// Hook to fetch single file
export function useFile(id: string) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: async () => {
      const response = await getFile({ path: { id } });
      if (response.error) {
        throw new Error('Failed to fetch file');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// Hook to upload file
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadFile({
        body: { file },
      });
      if (response.error) {
        throw new Error('Failed to upload file');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}

// Hook to delete file
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteFile({ path: { id } });
      if (response.error) {
        throw new Error('Failed to delete file');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}
