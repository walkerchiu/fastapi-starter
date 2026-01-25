import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton, SkeletonCard, SkeletonText } from './Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders MUI Skeleton component', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-root');
  });

  it('applies text variant by default', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-text');
  });

  it('applies circular variant', () => {
    render(<Skeleton variant="circular" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-circular');
  });

  it('applies rectangular variant', () => {
    render(<Skeleton variant="rectangular" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-rectangular');
  });

  it('applies pulse animation by default', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-pulse');
  });

  it('applies wave animation', () => {
    render(<Skeleton animation="wave" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-wave');
  });

  it('applies no animation', () => {
    render(<Skeleton animation="none" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).not.toHaveClass('MuiSkeleton-pulse');
    expect(skeleton).not.toHaveClass('MuiSkeleton-wave');
  });

  it('applies custom width as number', () => {
    render(<Skeleton width={100} />);
    expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '100px' });
  });

  it('applies custom width as string', () => {
    render(<Skeleton width="50%" />);
    expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '50%' });
  });

  it('applies custom height as number', () => {
    render(<Skeleton height={50} />);
    expect(screen.getByTestId('skeleton')).toHaveStyle({ height: '50px' });
  });

  it('applies custom height as string', () => {
    render(<Skeleton height="2em" />);
    expect(screen.getByTestId('skeleton')).toHaveStyle({ height: '2em' });
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-class" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('custom-class');
  });

  it('applies dimensions for circular variant', () => {
    render(<Skeleton variant="circular" width={40} height={40} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ height: '40px', width: '40px' });
  });
});

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    render(<SkeletonText />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('renders custom number of lines', () => {
    render(<SkeletonText lines={5} />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('has aria-hidden on container', () => {
    const { container } = render(<SkeletonText />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('makes last line shorter', () => {
    render(<SkeletonText lines={3} />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[2]).toHaveStyle({ width: '80%' });
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonText className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom animation', () => {
    render(<SkeletonText animation="none" />);
    const skeletons = screen.getAllByTestId('skeleton');
    skeletons.forEach((skeleton) => {
      expect(skeleton).not.toHaveClass('MuiSkeleton-pulse');
    });
  });
});

describe('SkeletonCard', () => {
  it('renders with default props', () => {
    render(<SkeletonCard />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has aria-hidden on container', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows avatar by default', () => {
    render(<SkeletonCard />);
    const circularSkeleton = screen
      .getAllByTestId('skeleton')
      .find((el) => el.classList.contains('MuiSkeleton-circular'));
    expect(circularSkeleton).toBeInTheDocument();
  });

  it('hides avatar when showAvatar is false', () => {
    render(<SkeletonCard showAvatar={false} />);
    const circularSkeleton = screen
      .getAllByTestId('skeleton')
      .find((el) => el.classList.contains('MuiSkeleton-circular'));
    expect(circularSkeleton).toBeUndefined();
  });

  it('shows title by default', () => {
    render(<SkeletonCard />);
    // Avatar (circular) + title (text) + 3 lines = 5 skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBe(5);
  });

  it('hides title when showTitle is false', () => {
    render(<SkeletonCard showTitle={false} />);
    // Avatar (circular) + 3 lines = 4 skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBe(4);
  });

  it('renders custom number of lines', () => {
    render(<SkeletonCard lines={5} />);
    // Avatar + title + 5 lines = 7 skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBe(7);
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom animation to all elements', () => {
    render(<SkeletonCard animation="none" />);
    const skeletons = screen.getAllByTestId('skeleton');
    skeletons.forEach((skeleton) => {
      expect(skeleton).not.toHaveClass('MuiSkeleton-pulse');
    });
  });
});
