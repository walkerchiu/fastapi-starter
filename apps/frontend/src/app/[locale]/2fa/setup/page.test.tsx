import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TwoFactorSetupPage from './page';

const mockPush = vi.fn();
let mockSessionStatus = 'authenticated' as
  | 'authenticated'
  | 'unauthenticated'
  | 'loading';
let mockSessionData: { accessToken: string; user: { email: string } } | null = {
  accessToken: 'test-token',
  user: { email: 'test@example.com' },
};

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: mockSessionData,
    status: mockSessionStatus,
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      setupTitle: 'Set Up Two-Factor Authentication',
      setupDescription: 'Add an extra layer of security to your account',
      step1Title: 'Step 1: Scan QR Code',
      step1Description: 'Scan this QR code with your authenticator app',
      manualEntry: "Can't scan? Enter this code manually:",
      continueToVerify: 'Continue to Verification',
      step2Title: 'Step 2: Verify Setup',
      step2Description: 'Enter the 6-digit code from your authenticator app',
      verificationCode: 'Verification Code',
      back: 'Back',
      enable2FA: 'Enable 2FA',
      tryAgain: 'Try Again',
      backToProfile: 'Back to Profile',
      invalidCode: 'Invalid verification code',
      enabledTitle: 'Two-Factor Authentication Enabled',
      enabledMessage: 'Two-factor authentication has been successfully enabled',
      saveBackupCodes: 'Save Your Backup Codes',
      backupCodesDescription: 'Store these codes in a safe place',
      copyAllCodes: 'Copy All Codes',
      returnToProfile: 'Return to Profile',
      setupFailed: 'Setup failed. Please try again.',
      enableFailed: 'Failed to enable 2FA',
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
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TwoFactorSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStatus = 'authenticated';
    mockSessionData = {
      accessToken: 'test-token',
      user: { email: 'test@example.com' },
    };
  });

  it('fetches and displays QR code on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          secret: 'TESTSECRET',
          qr_code: 'data:image/png;base64,test',
          manual_entry_key: 'TEST-SECRET-KEY',
        }),
    });

    await act(async () => {
      render(<TwoFactorSetupPage />);
    });

    await waitFor(() => {
      expect(screen.getByAltText('2FA QR Code')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Set Up Two-Factor Authentication'),
    ).toBeInTheDocument();
    expect(screen.getByText('TEST-SECRET-KEY')).toBeInTheDocument();
    expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
  });

  it('navigates through steps correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          secret: 'TESTSECRET',
          qr_code: 'data:image/png;base64,test',
          manual_entry_key: 'TEST-SECRET-KEY',
        }),
    });

    await act(async () => {
      render(<TwoFactorSetupPage />);
    });

    // Wait for QR code step
    await waitFor(() => {
      expect(screen.getByAltText('2FA QR Code')).toBeInTheDocument();
    });

    // Click continue to go to verify step
    const continueButton = screen.getByText('Continue to Verification');
    await act(async () => {
      fireEvent.click(continueButton);
    });

    // Now we should see the verification step
    await waitFor(() => {
      expect(screen.getByText('Step 2: Verify Setup')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('submits verification code and shows backup codes on success', async () => {
    let fetchCallCount = 0;
    mockFetch.mockImplementation(() => {
      fetchCallCount++;
      if (fetchCallCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              secret: 'TESTSECRET',
              qr_code: 'data:image/png;base64,test',
              manual_entry_key: 'TEST-SECRET-KEY',
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            backup_codes: ['code1', 'code2', 'code3'],
          }),
      });
    });

    await act(async () => {
      render(<TwoFactorSetupPage />);
    });

    // Wait for QR code step
    await waitFor(() => {
      expect(screen.getByAltText('2FA QR Code')).toBeInTheDocument();
    });

    // Go to verify step
    const continueButton = screen.getByText('Continue to Verification');
    await act(async () => {
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    // Enter verification code
    const input = screen.getByPlaceholderText('000000');
    await act(async () => {
      fireEvent.change(input, { target: { value: '123456' } });
    });

    // Wait for the button to be enabled (needs 6 digits)
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Enable 2FA' });
      expect(submitButton).not.toBeDisabled();
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Enable 2FA' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for success state
    await waitFor(() => {
      expect(
        screen.getByText('Two-Factor Authentication Enabled'),
      ).toBeInTheDocument();
    });

    // Backup codes should be displayed
    expect(screen.getByText('code1')).toBeInTheDocument();
    expect(screen.getByText('code2')).toBeInTheDocument();
    expect(screen.getByText('code3')).toBeInTheDocument();
  });

  it('shows error when verification fails', async () => {
    let fetchCallCount = 0;
    mockFetch.mockImplementation(() => {
      fetchCallCount++;
      if (fetchCallCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              secret: 'TESTSECRET',
              qr_code: 'data:image/png;base64,test',
              manual_entry_key: 'TEST-SECRET-KEY',
            }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid code' }),
      });
    });

    await act(async () => {
      render(<TwoFactorSetupPage />);
    });

    // Wait for QR code step
    await waitFor(() => {
      expect(screen.getByAltText('2FA QR Code')).toBeInTheDocument();
    });

    // Go to verify step
    const continueButton = screen.getByText('Continue to Verification');
    await act(async () => {
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    // Enter verification code
    const input = screen.getByPlaceholderText('000000');
    await act(async () => {
      fireEvent.change(input, { target: { value: '123456' } });
    });

    // Wait for the button to be enabled
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Enable 2FA' });
      expect(submitButton).not.toBeDisabled();
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Enable 2FA' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid code')).toBeInTheDocument();
    });

    // Verify we're still on the verify step (not success)
    expect(screen.getByText('Step 2: Verify Setup')).toBeInTheDocument();
  });

  it('only allows numeric input in verification step', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          secret: 'TESTSECRET',
          qr_code: 'data:image/png;base64,test',
          manual_entry_key: 'TEST-SECRET-KEY',
        }),
    });

    await act(async () => {
      render(<TwoFactorSetupPage />);
    });

    // Wait for QR code step
    await waitFor(() => {
      expect(screen.getByAltText('2FA QR Code')).toBeInTheDocument();
    });

    // Go to verify step
    const continueButton = screen.getByText('Continue to Verification');
    await act(async () => {
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'abc123def' } });
    });

    expect(input.value).toBe('123');
  });

  it('redirects to login when unauthenticated', async () => {
    mockSessionStatus = 'unauthenticated';
    mockSessionData = null;

    await act(async () => {
      render(<TwoFactorSetupPage />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?callbackUrl=/2fa/setup');
    });
  });

  it('can go back from verify step to scan step', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          secret: 'TESTSECRET',
          qr_code: 'data:image/png;base64,test',
          manual_entry_key: 'TEST-SECRET-KEY',
        }),
    });

    await act(async () => {
      render(<TwoFactorSetupPage />);
    });

    // Wait for QR code step
    await waitFor(() => {
      expect(screen.getByAltText('2FA QR Code')).toBeInTheDocument();
    });

    // Go to verify step
    const continueButton = screen.getByText('Continue to Verification');
    await act(async () => {
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Step 2: Verify Setup')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByText('Back');
    await act(async () => {
      fireEvent.click(backButton);
    });

    // Should be back at scan step
    await waitFor(() => {
      expect(screen.getByText('Step 1: Scan QR Code')).toBeInTheDocument();
    });
  });
});
