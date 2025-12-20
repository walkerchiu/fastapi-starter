import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from './page';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue('valid-reset-token'),
  }),
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reset password form with token', async () => {
    render(<ResetPasswordPage />);

    expect(
      await screen.findByRole('heading', { name: /reset your password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter new password/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm new password/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset password/i }),
    ).toBeInTheDocument();
  });

  it('allows user to type passwords', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    const newPasswordInput =
      await screen.findByPlaceholderText(/enter new password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i);

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');

    expect(newPasswordInput).toHaveValue('newpassword123');
    expect(confirmPasswordInput).toHaveValue('newpassword123');
  });

  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordPage />);

    const newPasswordInput =
      await screen.findByPlaceholderText(/enter new password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'differentpassword' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows error when password is too short', async () => {
    render(<ResetPasswordPage />);

    const newPasswordInput =
      await screen.findByPlaceholderText(/enter new password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state when submitting', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<ResetPasswordPage />);

    const newPasswordInput =
      await screen.findByPlaceholderText(/enter new password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled();
  });

  it('shows success message after successful reset', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Password reset successfully' }),
    });

    render(<ResetPasswordPage />);

    const newPasswordInput =
      await screen.findByPlaceholderText(/enter new password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password has been reset successfully/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/redirecting to login/i)).toBeInTheDocument();
  });

  it('shows error message on invalid token', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: 'Invalid or expired reset token' }),
    });

    render(<ResetPasswordPage />);

    const newPasswordInput =
      await screen.findByPlaceholderText(/enter new password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid or expired reset token/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<ResetPasswordPage />);

    const newPasswordInput =
      await screen.findByPlaceholderText(/enter new password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
