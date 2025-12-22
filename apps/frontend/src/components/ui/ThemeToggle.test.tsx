import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '@/components/providers/theme-provider';

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

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('renders the theme toggle button', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Current theme'),
    );
  });

  it('cycles through themes on click', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Initial state is system
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: System. Click to change.',
    );

    // Click to switch to light
    fireEvent.click(button);
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: Light. Click to change.',
    );

    // Click to switch to dark
    fireEvent.click(button);
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: Dark. Click to change.',
    );

    // Click to switch back to system
    fireEvent.click(button);
    expect(button).toHaveAttribute(
      'aria-label',
      'Current theme: System. Click to change.',
    );
  });

  it('saves theme preference to localStorage', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'theme-preference',
      'light',
    );

    fireEvent.click(button);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'theme-preference',
      'dark',
    );
  });

  it('applies custom className', () => {
    renderWithProvider(<ThemeToggle className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has correct base styling classes', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-md');
    expect(button).toHaveClass('p-2');
  });

  it('contains an SVG icon', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('updates DOM class when theme changes', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Click to light
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // Click to dark
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});
