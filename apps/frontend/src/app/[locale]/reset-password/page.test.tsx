import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? 'valid-token' : null),
  }),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Import after mocks are set up
import ResetPasswordPage from './page';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reset password form with token', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your new password below.'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter new password'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirm new password'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reset password' }),
    ).toBeInTheDocument();
  });

  it('allows user to type passwords', () => {
    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByPlaceholderText('Enter new password');
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Confirm new password',
    );

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });

    expect(newPasswordInput).toHaveValue('newpassword123');
    expect(confirmPasswordInput).toHaveValue('newpassword123');
  });

  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'differentpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('shows error when password is too short', async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters long.'),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state when submitting', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(screen.getByRole('button', { name: 'Resetting...' })).toBeDisabled();
  });

  it('shows success message after successful reset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Password reset' }),
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Your password has been reset successfully. Redirecting to login...',
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows error message on invalid token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Token expired' }),
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(screen.getByText('Token expired')).toBeInTheDocument();
    });
  });

  it('shows error message on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
