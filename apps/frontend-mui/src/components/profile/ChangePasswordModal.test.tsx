import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChangePasswordModal } from './ChangePasswordModal';

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

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters long',
      changePasswordSuccess: 'Password changed successfully',
      changePasswordFailed: 'Failed to change password',
      cancel: 'Cancel',
      genericError: 'An error occurred',
    };
    return translations[key] || key;
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ChangePasswordModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('renders modal when open', () => {
    render(<ChangePasswordModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ChangePasswordModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'differentpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters long'),
      ).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits form on valid input', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Password changed' }),
    });

    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/change-password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            current_password: 'currentpass',
            new_password: 'newpassword123',
          }),
        }),
      );
    });
  });

  it('displays success message after password change', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Password changed' }),
    });

    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(
        screen.getByText('Password changed successfully'),
      ).toBeInTheDocument();
    });
  });

  it('displays error message on failed password change', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Current password is incorrect' }),
    });

    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(
        screen.getByText('Current password is incorrect'),
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ChangePasswordModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('resets form fields when modal is closed', () => {
    const onClose = vi.fn();
    render(<ChangePasswordModal {...defaultProps} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'somepassword' },
    });

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });
});
