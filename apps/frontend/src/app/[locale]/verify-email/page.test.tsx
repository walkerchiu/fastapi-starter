import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VerifyEmailPage from './page';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      verifyingTitle: 'Verifying your email...',
      verifyingMessage: 'Please wait while we verify your email address.',
      successTitle: 'Email Verified',
      successMessage: 'Your email has been verified successfully.',
      errorTitle: 'Verification Failed',
      errorDescription: 'The verification link is invalid or has expired.',
      invalidLinkTitle: 'Verification Failed',
      noTokenMessage: 'The verification link is invalid or has expired.',
      checkEmailMessage:
        'Please check your email for a valid verification link.',
      goToLogin: 'Go to Login',
      verificationFailed: 'Email verification failed',
      genericError: 'An error occurred',
    };
    return translations[key] ?? key;
  },
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('token');
  });

  it('shows error when no token is provided', async () => {
    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
    expect(
      screen.getByText('The verification link is invalid or has expired.'),
    ).toBeInTheDocument();
  });

  it('shows success when verification succeeds', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Email verified successfully' }),
    });

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Email Verified')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Your email has been verified successfully.'),
    ).toBeInTheDocument();
  });

  it('shows error when verification fails', async () => {
    mockSearchParams.set('token', 'invalid-token');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Invalid token' }),
    });

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
  });

  it('shows error when network fails', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
  });

  it('shows loading state initially when token is provided', () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<VerifyEmailPage />);

    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
  });

  it('has a link to login page', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Go to Login')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Go to Login' })).toHaveAttribute(
      'href',
      '/login',
    );
  });
});
