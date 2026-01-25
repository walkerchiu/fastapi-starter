import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders title correctly', () => {
    render(<StatCard title="Total Users" value={100} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders value correctly', () => {
    render(<StatCard title="Count" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    render(<StatCard title="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders ReactNode value correctly', () => {
    render(
      <StatCard
        title="Custom"
        value={<span data-testid="custom">Custom Value</span>}
      />,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('has MUI Card styles', () => {
    const { container } = render(<StatCard title="Title" value="Value" />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('MuiPaper-elevation1');
  });

  it('applies MUI Typography styles to value', () => {
    render(<StatCard title="Title" value="Value" />);
    const value = screen.getByText('Value');
    expect(value).toHaveClass('MuiTypography-h4');
  });

  it('accepts custom valueClassName', () => {
    render(
      <StatCard
        title="Title"
        value="Value"
        valueClassName="text-lg text-green-600"
      />,
    );
    const value = screen.getByText('Value');
    expect(value).toHaveClass('text-lg');
    expect(value).toHaveClass('text-green-600');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <StatCard title="Title" value="Value" className="custom-class" />,
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toHaveClass('custom-class');
  });

  it('title has MUI Typography styles', () => {
    render(<StatCard title="Title" value="Value" />);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('MuiTypography-body2');
  });
});
