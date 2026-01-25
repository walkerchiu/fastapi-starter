import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeRegistry } from '@/theme/ThemeRegistry';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderWithProvider = async (ui: React.ReactElement) => {
  const result = render(<ThemeRegistry>{ui}</ThemeRegistry>);
  // Wait for theme to be mounted
  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  return result;
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the theme toggle button', async () => {
    await renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has correct aria-label', async () => {
    await renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Current theme'),
    );
  });

  it('cycles through themes on click', async () => {
    await renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Initial state is system
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: System. Click to change.',
    );

    // Click to switch to light
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: Light. Click to change.',
    );

    // Click to switch to dark
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: Dark. Click to change.',
    );

    // Click to switch back to system
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: System. Click to change.',
    );
  });

  it('saves theme preference to localStorage', async () => {
    await renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('applies custom className', async () => {
    await renderWithProvider(<ThemeToggle className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has MUI IconButton base styles', async () => {
    await renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiIconButton-root');
  });

  it('contains an SVG icon', async () => {
    await renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('updates DOM class when theme changes', async () => {
    await renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Click to light
    await act(async () => {
      fireEvent.click(button);
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Click to dark
    await act(async () => {
      fireEvent.click(button);
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
