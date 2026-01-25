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

// Placeholder hook for user registration
export function useRegister() {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name?: string;
    }) => {
      console.warn('useRegister: API not yet available');
      void data;
      return { id: '', email: '', name: '' };
    },
  });
}

// Placeholder hook for forgot password
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      console.warn('useForgotPassword: API not yet available');
      void data;
      return { message: 'Password reset email sent' };
    },
  });
}

// Placeholder hook for reset password
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      console.warn('useResetPassword: API not yet available');
      void data;
      return { message: 'Password reset successful' };
    },
  });
}

// Placeholder hook for email verification
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      console.warn('useVerifyEmail: API not yet available');
      void data;
      return { message: 'Email verified successfully' };
    },
  });
}

// Placeholder hook for enabling 2FA
export function useEnable2FA() {
  return useMutation({
    mutationFn: async () => {
      console.warn('useEnable2FA: API not yet available');
      return {
        secret: 'PLACEHOLDER_SECRET',
        qr_code: 'data:image/png;base64,placeholder',
        backup_codes: ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'],
      };
    },
  });
}

// Placeholder hook for verifying 2FA
export function useVerify2FA() {
  return useMutation({
    mutationFn: async (data: { user_id: string; code: string }) => {
      console.warn('useVerify2FA: API not yet available');
      void data;
      // Return mock token data matching expected page usage
      return {
        verified: true,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      };
    },
  });
}

// Placeholder hook for disabling 2FA
export function useDisable2FA() {
  return useMutation({
    mutationFn: async (data: { code: string }) => {
      console.warn('useDisable2FA: API not yet available');
      void data;
      return { message: '2FA disabled successfully' };
    },
  });
}

// Placeholder hook for regenerating backup codes
export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: async (data: { code: string }) => {
      console.warn('useRegenerateBackupCodes: API not yet available');
      void data;
      return {
        backup_codes: ['NEW1', 'NEW2', 'NEW3', 'NEW4', 'NEW5'],
      };
    },
  });
}
