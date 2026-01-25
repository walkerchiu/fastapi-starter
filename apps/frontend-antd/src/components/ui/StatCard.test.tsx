import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders title correctly', () => {
    render(<StatCard title="Total Users" value={100} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders value correctly', () => {
    render(<StatCard title="Total Users" value={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders formatted value', () => {
    render(<StatCard title="Revenue" value={1234567} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders with prefix', () => {
    render(<StatCard title="Revenue" value={1000} prefix="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<StatCard title="Growth" value={25} suffix="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders trend indicator', () => {
    render(<StatCard title="Growth" value={25} trend="up" trendValue="10%" />);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  it('renders with precision', () => {
    render(<StatCard title="Rate" value={3.14159} precision={2} />);
    // Ant Design Statistic formats with precision
    const statValue = document.querySelector('.ant-statistic-content-value');
    expect(statValue?.textContent).toContain('3.14');
  });

  it('shows loading state', () => {
    render(<StatCard title="Loading" value={0} loading />);
    expect(document.querySelector('.ant-card-loading')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<StatCard title="Test" value={100} className="custom-class" />);
    const card = document.querySelector('.ant-card');
    expect(card).toHaveClass('custom-class');
  });
});
