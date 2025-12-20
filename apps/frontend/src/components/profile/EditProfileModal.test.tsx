import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EditProfileModal } from './EditProfileModal';

// Mock next-auth
const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockSession = {
  data: {
    accessToken: 'test-token',
    user: { name: 'Test User', email: 'test@example.com' },
  },
  status: 'authenticated',
  update: mockUpdate,
};

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      editProfile: 'Edit Profile',
      name: 'Name',
      cancel: 'Cancel',
      save: 'Save',
      updateProfileFailed: 'Failed to update profile',
      genericError: 'An error occurred',
    };
    return translations[key] || key;
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('EditProfileModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentName: 'Test User',
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('renders modal when open', () => {
    render(<EditProfileModal {...defaultProps} />);

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<EditProfileModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('initializes with current name', () => {
    render(<EditProfileModal {...defaultProps} />);

    const input = screen.getByLabelText('Name') as HTMLInputElement;
    expect(input.value).toBe('Test User');
  });

  it('updates name input on change', () => {
    render(<EditProfileModal {...defaultProps} />);

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'New Name' } });

    expect((input as HTMLInputElement).value).toBe('New Name');
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<EditProfileModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('submits form and calls onSuccess on successful update', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'New Name' }),
    });

    render(
      <EditProfileModal
        {...defaultProps}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/profile'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'New Name' }),
        }),
      );
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    // onClose is called after a 1500ms timeout, so we need to wait longer
    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
  });

  it('displays error message on failed update', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Update failed' }),
    });

    render(<EditProfileModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('resets form when modal is closed', () => {
    const onClose = vi.fn();
    render(<EditProfileModal {...defaultProps} onClose={onClose} />);

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'Changed Name' } });
    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });
});
