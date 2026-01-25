import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { Provider } from 'urql';
import { fromValue, delay, pipe } from 'wonka';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

const mockPush = vi.fn();

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Profile',
      subtitle: 'Manage your account settings',
      userInformation: 'Account Information',
      name: 'Name',
      email: 'Email',
      roles: 'Roles',
      noRolesAssigned: 'No roles assigned',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      memberSince: 'Member since',
      edit: 'Edit',
      security: 'Security',
      password: 'Password',
      changePasswordDescription: 'Change your account password',
      change: 'Change',
      twoFactorAuth: 'Two-Factor Authentication',
      enabled: 'Enabled',
      disabled: 'Disabled',
      twoFactorAuthDescription: 'Add an extra layer of security',
      enable: 'Enable',
      disable: 'Disable',
      backupCodes: 'Backup Codes',
      backupCodesDescription: 'Use these codes if you lose access',
      regenerate: 'Regenerate',
      editProfile: 'Edit Profile',
      cancel: 'Cancel',
      save: 'Save Changes',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
    };
    return translations[key] || key;
  },
}));

// Import after mocks are set up
import ProfilePage from './page';

const mockMeData = {
  data: {
    me: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockClient(mockData: Record<string, any> = {}) {
  return {
    executeQuery: ({
      query,
    }: {
      query: { definitions: { name?: { value: string } }[] };
    }) => {
      const operationName = query.definitions[0]?.name?.value;
      if (operationName === 'Me') {
        return pipe(fromValue(mockData['me'] ?? mockMeData), delay(0));
      }
      return pipe(fromValue({ data: null }), delay(0));
    },
    executeMutation: () => pipe(fromValue({ data: null }), delay(0)),
    executeSubscription: () => pipe(fromValue({ data: null }), delay(0)),
  };
}

function renderWithProvider(
  ui: React.ReactElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockData: Record<string, any> = {},
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = createMockClient(mockData) as any;
  return render(<Provider value={client}>{ui}</Provider>);
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    renderWithProvider(<ProfilePage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', async () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?callbackUrl=/profile');
    });
  });

  it('displays profile header when authenticated', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your account settings'),
      ).toBeInTheDocument();
    });
  });

  it('displays user information when authenticated', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('displays active status badge', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('displays security section', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(
        screen.getByText('Change your account password'),
      ).toBeInTheDocument();
    });
  });

  it('opens edit profile modal when Edit button is clicked', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('opens change password modal when Change button is clicked', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Password')).toBeInTheDocument();
    });

    const changeButton = screen.getByRole('button', { name: 'Change' });
    fireEvent.click(changeButton);

    await waitFor(() => {
      // Check for the modal heading
      expect(
        screen.getByRole('heading', { name: 'Change Password' }),
      ).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const errorData = {
      me: {
        data: null,
        error: { message: 'Network error' },
      },
    };

    renderWithProvider(<ProfilePage />, errorData);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays member since date', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithProvider(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Member since')).toBeInTheDocument();
    });
  });
});
