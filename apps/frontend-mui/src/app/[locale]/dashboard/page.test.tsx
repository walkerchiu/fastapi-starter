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
  useTranslations:
    (namespace: string) => (key: string, params?: Record<string, string>) => {
      const translations: Record<string, Record<string, string>> = {
        dashboard: {
          title: 'Dashboard',
          welcome: 'Welcome back, {name}!',
          loading: 'Loading...',
          error: 'An error occurred',
          noUsersFound: 'No users found',
          totalUsers: 'Total Users',
          yourEmail: 'Your Email',
          status: 'Status',
          active: 'Active',
          inactive: 'Inactive',
          apiType: 'API Type',
          usingGraphQL: 'Using urql + Strawberry',
          usersViaGraphQL: 'Users (via GraphQL)',
          usersTitle: 'Users',
          tableId: 'ID',
          tableName: 'Name',
          tableEmail: 'Email',
          tableStatus: 'Status',
        },
      };
      let result = translations[namespace]?.[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(`{${paramKey}}`, paramValue || '');
        });
      }
      return result;
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
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User One',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User Two',
          isActive: false,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ],
      total: 2,
      skip: 0,
      limit: 10,
      hasMore: false,
    },
  },
};

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
      if (operationName === 'Users') {
        return pipe(fromValue(mockData['users'] ?? mockUsersData), delay(0));
      }
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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    renderWithProvider(<DashboardPage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
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

  it('displays dashboard content when authenticated', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    renderWithProvider(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, Test User!/)).toBeInTheDocument();
  });

  it('displays user email when name is not available', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    renderWithProvider(<DashboardPage />);

    expect(
      screen.getByText(/Welcome back, test@example.com!/),
    ).toBeInTheDocument();
  });

  it('displays users list', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    renderWithProvider(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  it('displays total users count', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
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

  it('displays active and inactive status badges', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    renderWithProvider(<DashboardPage />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active');
      const inactiveBadges = screen.getAllByText('Inactive');
      expect(activeBadges.length).toBeGreaterThan(0);
      expect(inactiveBadges.length).toBe(1);
    });
  });

  it('displays error message when API fails', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
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
      me: mockMeData,
    };

    renderWithProvider(<DashboardPage />, errorData);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays empty state when no users', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    const emptyData = {
      users: {
        data: {
          users: {
            items: [],
            total: 0,
            skip: 0,
            limit: 10,
            hasMore: false,
          },
        },
      },
      me: mockMeData,
    };

    renderWithProvider(<DashboardPage />, emptyData);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('displays REST toggle button', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    renderWithProvider(<DashboardPage />);

    expect(screen.getByText('GraphQL')).toBeInTheDocument();
    expect(screen.getByText('REST')).toBeInTheDocument();
    expect(screen.getByText('Using urql + Strawberry')).toBeInTheDocument();
  });

  it('switches to REST API when REST button is clicked', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    renderWithProvider(<DashboardPage />);

    // Initially shows GraphQL indicator
    expect(screen.getByText('Using urql + Strawberry')).toBeInTheDocument();
    expect(screen.getByText('Users (via GraphQL)')).toBeInTheDocument();

    const restButton = screen.getByText('REST');
    fireEvent.click(restButton);

    // After clicking REST, GraphQL indicators should be hidden
    await waitFor(() => {
      expect(
        screen.queryByText('Using urql + Strawberry'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Users (via GraphQL)')).not.toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('switches back to GraphQL API when GraphQL button is clicked', async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    renderWithProvider(<DashboardPage />);

    // First switch to REST
    const restButton = screen.getByText('REST');
    fireEvent.click(restButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Using urql + Strawberry'),
      ).not.toBeInTheDocument();
    });

    // Then switch back to GraphQL
    const graphqlButton = screen.getByText('GraphQL');
    fireEvent.click(graphqlButton);

    await waitFor(() => {
      expect(screen.getByText('Using urql + Strawberry')).toBeInTheDocument();
      expect(screen.getByText('Users (via GraphQL)')).toBeInTheDocument();
    });
  });
});
