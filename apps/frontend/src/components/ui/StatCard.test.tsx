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

  it('has base card styles', () => {
    render(<StatCard title="Title" value="Value" />);
    const card = screen.getByText('Title').closest('div');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('p-6');
    expect(card).toHaveClass('shadow');
  });

  it('applies default value styles', () => {
    render(<StatCard title="Title" value="Value" />);
    const value = screen.getByText('Value');
    expect(value).toHaveClass('text-3xl');
    expect(value).toHaveClass('font-bold');
    expect(value).toHaveClass('text-indigo-600');
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
    render(<StatCard title="Title" value="Value" className="custom-class" />);
    const card = screen.getByText('Title').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('title has correct styles', () => {
    render(<StatCard title="Title" value="Value" />);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('text-sm');
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('text-gray-500');
  });
});
