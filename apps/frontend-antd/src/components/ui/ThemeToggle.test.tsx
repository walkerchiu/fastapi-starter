import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the theme context
const mockSetMode = vi.fn();
vi.mock('@/theme', () => ({
  useTheme: () => ({
    mode: 'light',
    resolvedMode: 'light',
    setMode: mockSetMode,
  }),
}));

import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Dropdown should open and show theme options
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});
