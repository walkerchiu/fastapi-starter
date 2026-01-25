import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useSearchParams
let mockUserId: string | null = null;
let mockCallbackUrl: string | null = null;
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'user_id') return mockUserId;
      if (key === 'callbackUrl') return mockCallbackUrl;
      return null;
    },
  }),
}));

// Mock signIn
const mockSignIn = vi.fn();
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// Mock useVerify2FA
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/api', () => ({
  useVerify2FA: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Mock useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Two-Factor Authentication',
      description: 'Enter the code from your authenticator app',
      code: 'Verification Code',
      verify: 'Verify',
      verifying: 'Verifying...',
      backupCodeHint: 'Lost your device?',
      invalidSession: 'Invalid Session',
      invalidSessionMessage: 'Please log in again',
      backToLogin: 'Back to Login',
      verificationFailed: 'Verification failed',
      genericError: 'An error occurred',
    };
    return translations[key] ?? key;
  },
}));

import TwoFactorVerifyPage from './page';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe('TwoFactorVerifyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserId = null;
    mockCallbackUrl = null;
  });

  it('shows error when no userId is provided', () => {
    renderWithProviders(<TwoFactorVerifyPage />);

    expect(screen.getByText('Invalid Session')).toBeInTheDocument();
    expect(screen.getByText('Back to Login')).toBeInTheDocument();
  });

  it('renders verification form when userId is provided', () => {
    mockUserId = '123';

    renderWithProviders(<TwoFactorVerifyPage />);

    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
  });

  it('submits code and redirects on success', async () => {
    mockUserId = '123';
    mockCallbackUrl = '/dashboard';
    mockMutateAsync.mockResolvedValueOnce({
      access_token: 'new-token',
      refresh_token: 'new-refresh',
    });
    mockSignIn.mockResolvedValueOnce({ error: null });

    renderWithProviders(<TwoFactorVerifyPage />);

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: 'Verify' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        user_id: '123',
        code: '123456',
      });
    });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error when verification fails', async () => {
    mockUserId = '123';
    mockMutateAsync.mockRejectedValueOnce(new Error('Invalid code'));

    renderWithProviders(<TwoFactorVerifyPage />);

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: 'Verify' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid code')).toBeInTheDocument();
    });
  });

  it('navigates to login when back button clicked on error state', () => {
    renderWithProviders(<TwoFactorVerifyPage />);

    const backButton = screen.getByText('Back to Login');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
