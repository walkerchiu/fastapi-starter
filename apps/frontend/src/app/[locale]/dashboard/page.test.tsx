import { render, screen, waitFor } from '@testing-library/react';
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
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back',
        loading: 'Loading...',
        error: 'An error occurred',
        noUsers: 'No users found',
        totalUsers: 'Total Users',
        activeUsers: 'Active Users',
        inactiveUsers: 'Inactive Users',
      },
    };
    return translations[namespace]?.[key] ?? key;
  },
}));

vi.mock('@/hooks', () => ({
  useUsers: vi.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
  }),
  useMe: vi.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

// Import after mocks are set up
import DashboardPage from './page';

const mockUsersData = {
  data: {
    users: {
      items: [
        { id: 1, email: 'user1@example.com', name: 'User 1', isActive: true },
        { id: 2, email: 'user2@example.com', name: 'User 2', isActive: true },
        { id: 3, email: 'user3@example.com', name: 'User 3', isActive: false },
      ],
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockClient(mockData: Record<string, any> = {}) {
  return {
    executeQuery: () => {
      return pipe(fromValue(mockData['users'] ?? mockUsersData), delay(0));
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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when session is loading', () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    renderWithProvider(<DashboardPage />);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', async () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    renderWithProvider(<DashboardPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?callbackUrl=/dashboard');
    });
  });

  it('renders dashboard title when authenticated', async () => {
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
    });

    renderWithProvider(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('displays user statistics', async () => {
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
    });

    renderWithProvider(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });
  });

  it('displays user list', async () => {
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
    });

    renderWithProvider(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
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
    });

    const errorData = {
      users: {
        data: null,
        error: { message: 'Network error' },
      },
    };

    renderWithProvider(<DashboardPage />, errorData);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
