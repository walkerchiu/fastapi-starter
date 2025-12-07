import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';

vi.mock('@/lib/api', () => ({
  rootGet: vi.fn(),
}));

import { rootGet } from '@/lib/api';

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(rootGet).mockReturnValue(new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render message from API', async () => {
    vi.mocked(rootGet).mockResolvedValue({
      data: { message: 'Hello World' },
      error: undefined,
      request: new Request('http://localhost:8000/'),
      response: new Response(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('should render error state on API failure', async () => {
    vi.mocked(rootGet).mockResolvedValue({
      data: undefined,
      error: { detail: 'Error' },
      request: new Request('http://localhost:8000/'),
      response: new Response(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('should render helpful message when backend is not running', async () => {
    vi.mocked(rootGet).mockResolvedValue({
      data: undefined,
      error: new Error('Network error'),
      request: new Request('http://localhost:8000/'),
      response: undefined,
    });

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText(/backend server is not running/i),
      ).toBeInTheDocument();
    });
  });
});
