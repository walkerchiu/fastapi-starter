import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Home from './page';

vi.mock('@/lib/api', () => ({
  rootGet: vi.fn(),
}));

import { rootGet } from '@/lib/api';

const mockRootGet = vi.mocked(rootGet);

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockRootGet.mockReturnValue(new Promise(() => {}));
    render(<Home />);
    // 'loading' is the translation key
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should render message from API on success', async () => {
    mockRootGet.mockResolvedValue({
      data: { message: 'Hello from API!' },
      error: undefined,
      request: new Request('http://localhost:8000/'),
      response: new Response(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Hello from API!')).toBeInTheDocument();
    });
  });

  it('should render error message on API failure', async () => {
    mockRootGet.mockResolvedValue({
      data: undefined,
      error: { message: 'Network error' },
      request: new Request('http://localhost:8000/'),
      response: new Response(),
    });

    render(<Home />);

    await waitFor(() => {
      // 'error' is the translation key
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  it('should render "noMessage" when API returns empty data', async () => {
    mockRootGet.mockResolvedValue({
      data: {},
      error: undefined,
      request: new Request('http://localhost:8000/'),
      response: new Response(),
    });

    render(<Home />);

    await waitFor(() => {
      // 'noMessage' is the translation key
      expect(screen.getByText('noMessage')).toBeInTheDocument();
    });
  });
});
