import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Disable2FAModal } from './Disable2FAModal';

// Mock next-auth
const mockSession = {
  data: {
    accessToken: 'test-token',
    user: { name: 'Test User', email: 'test@example.com' },
  },
  status: 'authenticated',
};

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Disable Two-Factor Authentication',
      description:
        'Are you sure you want to disable two-factor authentication?',
      warning: 'After disabling, you will only need your password to sign in.',
      password: 'Enter your password to confirm',
      submit: 'Disable 2FA',
      submitting: 'Disabling...',
      success: 'Two-factor authentication has been disabled.',
      invalidPassword: 'Invalid password',
      genericError: 'An error occurred. Please try again.',
    };
    return translations[key] || key;
  },
}));

// Mock env
vi.mock('@/config/env', () => ({
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8000',
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Disable2FAModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('renders modal when open', () => {
    render(<Disable2FAModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('Disable Two-Factor Authentication'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Are you sure you want to disable two-factor authentication?',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Enter your password to confirm'),
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Disable2FAModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows warning message', () => {
    render(<Disable2FAModal {...defaultProps} />);

    expect(
      screen.getByText(
        'After disabling, you will only need your password to sign in.',
      ),
    ).toBeInTheDocument();
  });

  it('submits form with password', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: '2FA disabled' }),
    });

    render(<Disable2FAModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Enter your password to confirm'), {
      target: { value: 'mypassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/2fa/disable'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ password: 'mypassword123' }),
        }),
      );
    });
  });

  it('displays success message after disabling 2FA', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: '2FA disabled' }),
    });

    render(<Disable2FAModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Enter your password to confirm'), {
      target: { value: 'mypassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    await waitFor(() => {
      expect(
        screen.getByText('Two-factor authentication has been disabled.'),
      ).toBeInTheDocument();
    });
  });

  it('displays error message on failed disable', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid password' }),
    });

    render(<Disable2FAModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Enter your password to confirm'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<Disable2FAModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSuccess after successful disable', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: '2FA disabled' }),
    });

    render(
      <Disable2FAModal
        {...defaultProps}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText('Enter your password to confirm'), {
      target: { value: 'mypassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    await waitFor(() => {
      expect(
        screen.getByText('Two-factor authentication has been disabled.'),
      ).toBeInTheDocument();
    });

    // Wait for setTimeout to complete (1500ms)
    await waitFor(
      () => {
        expect(onSuccess).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
  });

  it('disables submit button when password is empty', () => {
    render(<Disable2FAModal {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Disable 2FA' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when password is entered', () => {
    render(<Disable2FAModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Enter your password to confirm'), {
      target: { value: 'mypassword' },
    });

    const submitButton = screen.getByRole('button', { name: 'Disable 2FA' });
    expect(submitButton).not.toBeDisabled();
  });
});
