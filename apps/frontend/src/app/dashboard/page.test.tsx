import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
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

vi.mock('@repo/api-client', () => ({
  client: {
    setConfig: vi.fn(),
  },
  listUsersApiV1UsersGet: vi.fn().mockResolvedValue({
    data: {
      items: [
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User One',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User Two',
          is_active: false,
          created_at: '2024-01-02T00:00:00Z',
        },
      ],
      total: 2,
      skip: 0,
      limit: 10,
    },
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<DashboardPage />);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', async () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<DashboardPage />);

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

    render(<DashboardPage />);

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

    render(<DashboardPage />);

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

    render(<DashboardPage />);

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

    render(<DashboardPage />);

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

    render(<DashboardPage />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active');
      const inactiveBadges = screen.getAllByText('Inactive');
      expect(activeBadges.length).toBeGreaterThan(0);
      expect(inactiveBadges.length).toBe(1);
    });
  });
});
