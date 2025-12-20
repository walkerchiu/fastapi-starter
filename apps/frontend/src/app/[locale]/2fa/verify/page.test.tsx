import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TwoFactorVerifyPage from './page';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      verifyTitle: 'Two-Factor Authentication',
      enterAuthCode: 'Enter the code from your authenticator app',
      enterBackupCode: 'Enter your backup code',
      verificationCode: 'Verification Code',
      backupCode: 'Backup Code',
      verify: 'Verify',
      useBackupCode: 'Use a backup code instead',
      useAuthApp: 'Use authenticator app',
      invalidCode: 'Invalid verification code',
      invalidRequest: 'An error occurred. Please try again.',
      verifyFailed: 'Verification failed',
      goToLogin: 'Go to Login',
      cancelAndReturn: 'Cancel and return to login',
      enterBackupCodePlaceholder: 'Enter backup code',
    };
    return translations[key] ?? key;
  },
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockSessionStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('TwoFactorVerifyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('user_id');
    mockSearchParams.delete('callbackUrl');
  });

  it('shows error when no user_id is provided', () => {
    render(<TwoFactorVerifyPage />);

    expect(
      screen.getByText('An error occurred. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders verification form when user_id is provided', () => {
    mockSearchParams.set('user_id', '123');

    render(<TwoFactorVerifyPage />);

    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
  });

  it('submits code and redirects to 2fa-callback on success', async () => {
    mockSearchParams.set('user_id', '123');
    mockSearchParams.set('callbackUrl', '/dashboard');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        }),
    });

    render(<TwoFactorVerifyPage />);

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: 'Verify' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/2fa/verify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            user_id: 123,
            code: '123456',
            is_backup_code: false,
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        '2fa_tokens',
        JSON.stringify({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/2fa-callback?callbackUrl=%2Fdashboard',
      );
    });
  });

  it('shows error when verification fails', async () => {
    mockSearchParams.set('user_id', '123');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Invalid code' }),
    });

    render(<TwoFactorVerifyPage />);

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: 'Verify' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid code')).toBeInTheDocument();
    });
  });

  it('toggles between authenticator and backup code mode', () => {
    mockSearchParams.set('user_id', '123');

    render(<TwoFactorVerifyPage />);

    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();

    const toggleButton = screen.getByText('Use a backup code instead');
    fireEvent.click(toggleButton);

    expect(screen.queryByPlaceholderText('000000')).not.toBeInTheDocument();
    expect(screen.getByText('Use authenticator app')).toBeInTheDocument();
  });

  it('only allows numeric input in authenticator mode', () => {
    mockSearchParams.set('user_id', '123');

    render(<TwoFactorVerifyPage />);

    const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc123def' } });

    expect(input.value).toBe('123');
  });

  it('allows alphanumeric input in backup code mode', () => {
    mockSearchParams.set('user_id', '123');

    render(<TwoFactorVerifyPage />);

    const toggleButton = screen.getByText('Use a backup code instead');
    fireEvent.click(toggleButton);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ABC123-XYZ' } });

    expect(input.value).toBe('ABC123-XYZ');
  });
});
