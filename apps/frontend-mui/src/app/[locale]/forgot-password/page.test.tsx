import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'auth.forgotPassword': {
        title: 'Forgot your password?',
        description: 'Enter your email and we will send you a reset link.',
        email: 'Email address',
        submit: 'Send reset link',
        submitting: 'Sending...',
        successTitle: 'Check your email',
        successDescription: 'We have sent you a password reset link.',
        successMessage: 'If an account exists, you will receive an email.',
        backToLogin: 'Back to login',
        returnToLogin: 'Return to login',
        genericError: 'An error occurred',
      },
    };
    return translations[namespace]?.[key] ?? key;
  },
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Import after mocks are set up
import ForgotPasswordPage from './page';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forgot password form', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your email and we will send you a reset link.'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send reset link' }),
    ).toBeInTheDocument();
  });

  it('shows back to login link', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText('Back to login')).toBeInTheDocument();
  });

  it('allows entering email', () => {
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('shows loading state when submitting', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
  });

  it('shows success message after submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Email sent' }),
    });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
      expect(
        screen.getByText('If an account exists, you will receive an email.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Server error' }),
    });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows error message on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      // Page shows t('genericError') for all catch errors
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
