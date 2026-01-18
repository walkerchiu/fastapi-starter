import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  type UpdateProfileData,
  type ChangePasswordData,
} from '@repo/api-client';

// Query key factory for auth
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Hook to fetch current user
export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await getCurrentUser();
      if (response.error) {
        throw new Error('Failed to fetch current user');
      }
      return response.data;
    },
  });
}

// Hook to update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData['body']) => {
      const response = await updateProfile({ body: data });
      if (response.error) {
        throw new Error('Failed to update profile');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

// Hook to change password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData['body']) => {
      const response = await changePassword({ body: data });
      if (response.error) {
        throw new Error('Failed to change password');
      }
      return response.data;
    },
  });
}
