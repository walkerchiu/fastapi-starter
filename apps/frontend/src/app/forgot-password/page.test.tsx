import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordPage from './page';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forgot password form', () => {
    render(<ForgotPasswordPage />);

    expect(
      screen.getByRole('heading', { name: /forgot your password/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it('renders link back to login page', () => {
    render(<ForgotPasswordPage />);

    const loginLink = screen.getByRole('link', { name: /back to login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('allows user to type email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('shows loading state when submitting', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('shows success message after successful submission', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          message: 'If the email exists, a reset link has been sent',
        }),
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/if an account exists with that email address/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: /return to login/i }),
    ).toBeInTheDocument();
  });

  it('shows error message on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: 'Failed to send reset email' }),
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to send reset email/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
