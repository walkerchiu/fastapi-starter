import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders skeleton correctly', () => {
    render(<Skeleton />);
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('renders with custom width', () => {
    render(<Skeleton width={200} />);
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<Skeleton height={100} />);
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('renders circular variant', () => {
    render(<Skeleton variant="circular" />);
    expect(document.querySelector('.ant-skeleton-avatar')).toBeInTheDocument();
  });

  it('renders text variant', () => {
    render(<Skeleton variant="text" />);
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<Skeleton className="custom-class" />);
    const skeleton = document.querySelector('.ant-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });
});
