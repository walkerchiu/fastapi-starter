import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders MUI CircularProgress', () => {
    const { container } = render(<Spinner />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    const { container } = render(<Spinner />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveAttribute('aria-label', 'Loading');
  });

  it('includes screen reader text', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('applies small size', () => {
    const { container } = render(<Spinner size="sm" />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveStyle({ width: '16px', height: '16px' });
  });

  it('applies medium size by default', () => {
    const { container } = render(<Spinner />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('applies medium size explicitly', () => {
    const { container } = render(<Spinner size="md" />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('applies large size', () => {
    const { container } = render(<Spinner size="lg" />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('accepts custom className', () => {
    render(<Spinner className="custom-class" />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('accepts custom aria-label', () => {
    const { container } = render(<Spinner aria-label="Custom loading" />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toHaveAttribute('aria-label', 'Custom loading');
    expect(screen.getByText('Custom loading')).toBeInTheDocument();
  });
});
