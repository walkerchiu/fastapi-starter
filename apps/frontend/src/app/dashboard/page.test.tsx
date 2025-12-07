import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { Provider } from 'urql';
import { fromValue, delay, pipe } from 'wonka';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import DashboardPage from './page';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
        return pipe(fromValue(mockData.users ?? mockUsersData), delay(0));
      }
      if (operationName === 'Me') {
        return pipe(fromValue(mockData.me ?? mockMeData), delay(0));
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
});
