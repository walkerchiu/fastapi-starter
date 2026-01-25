import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RegenerateBackupCodesModal } from './RegenerateBackupCodesModal';

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
      title: 'Regenerate Backup Codes',
      description:
        'This will invalidate all your existing backup codes and generate new ones.',
      warning: 'Make sure to save your new backup codes in a safe place.',
      submit: 'Regenerate Codes',
      submitting: 'Generating...',
      newCodesTitle: 'Your New Backup Codes',
      newCodesDescription:
        'Store these codes in a safe place. Each code can only be used once.',
      copyAll: 'Copy All Codes',
      copied: 'Copied!',
      done: 'Done',
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

// Mock clipboard
const mockClipboard = {
  writeText: vi.fn(),
};
Object.assign(navigator, { clipboard: mockClipboard });

describe('RegenerateBackupCodesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  const mockBackupCodes = [
    'CODE1111',
    'CODE2222',
    'CODE3333',
    'CODE4444',
    'CODE5555',
    'CODE6666',
    'CODE7777',
    'CODE8888',
    'CODE9999',
    'CODE0000',
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockClipboard.writeText.mockReset();
  });

  it('renders modal when open', () => {
    render(<RegenerateBackupCodesModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Regenerate Backup Codes')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This will invalidate all your existing backup codes and generate new ones.',
      ),
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<RegenerateBackupCodesModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows warning message', () => {
    render(<RegenerateBackupCodesModal {...defaultProps} />);

    expect(
      screen.getByText(
        'Make sure to save your new backup codes in a safe place.',
      ),
    ).toBeInTheDocument();
  });

  it('calls API to regenerate backup codes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ backup_codes: mockBackupCodes }),
    });

    render(<RegenerateBackupCodesModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/2fa/backup-codes'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });

  it('displays backup codes after regeneration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ backup_codes: mockBackupCodes }),
    });

    render(<RegenerateBackupCodesModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));

    await waitFor(() => {
      expect(screen.getByText('Your New Backup Codes')).toBeInTheDocument();
    });

    // Check that some codes are displayed
    expect(screen.getByText('CODE1111')).toBeInTheDocument();
    expect(screen.getByText('CODE5555')).toBeInTheDocument();
  });

  it('displays error message on failed regeneration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Failed to regenerate codes' }),
    });

    render(<RegenerateBackupCodesModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to regenerate codes'),
      ).toBeInTheDocument();
    });
  });

  it('copies backup codes to clipboard', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ backup_codes: mockBackupCodes }),
    });
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    render(<RegenerateBackupCodesModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));

    await waitFor(() => {
      expect(screen.getByText('Your New Backup Codes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy All Codes' }));

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        mockBackupCodes.join('\n'),
      );
    });
  });

  it('shows copied confirmation after copying', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ backup_codes: mockBackupCodes }),
    });
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    render(<RegenerateBackupCodesModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));

    await waitFor(() => {
      expect(screen.getByText('Your New Backup Codes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy All Codes' }));

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<RegenerateBackupCodesModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when done button is clicked after regeneration', async () => {
    const onClose = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ backup_codes: mockBackupCodes }),
    });

    render(<RegenerateBackupCodesModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));

    await waitFor(() => {
      expect(screen.getByText('Your New Backup Codes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('resets state when modal is closed and reopened', async () => {
    const onClose = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ backup_codes: mockBackupCodes }),
    });

    const { rerender } = render(
      <RegenerateBackupCodesModal {...defaultProps} onClose={onClose} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));

    await waitFor(() => {
      expect(screen.getByText('Your New Backup Codes')).toBeInTheDocument();
    });

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    // Rerender as closed then open
    rerender(
      <RegenerateBackupCodesModal
        {...defaultProps}
        isOpen={false}
        onClose={onClose}
      />,
    );
    rerender(
      <RegenerateBackupCodesModal {...defaultProps} onClose={onClose} />,
    );

    // Should show initial state again
    expect(
      screen.getByText(
        'This will invalidate all your existing backup codes and generate new ones.',
      ),
    ).toBeInTheDocument();
  });
});
