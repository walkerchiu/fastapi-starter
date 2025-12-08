import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from './Alert';

describe('Alert', () => {
  it('renders children correctly', () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies info variant by default', () => {
    render(<Alert>Info message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50');
  });

  it('applies error variant styles', () => {
    render(<Alert variant="error">Error message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50');
    expect(screen.getByText('Error message')).toHaveClass('text-red-700');
  });

  it('applies success variant styles', () => {
    render(<Alert variant="success">Success message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-green-50');
    expect(screen.getByText('Success message')).toHaveClass('text-green-700');
  });

  it('applies warning variant styles', () => {
    render(<Alert variant="warning">Warning message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50');
    expect(screen.getByText('Warning message')).toHaveClass('text-yellow-700');
  });

  it('applies info variant styles explicitly', () => {
    render(<Alert variant="info">Info message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50');
    expect(screen.getByText('Info message')).toHaveClass('text-blue-700');
  });

  it('accepts custom className', () => {
    render(<Alert className="custom-class">Message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('preserves base styles with custom className', () => {
    render(<Alert className="custom-class">Message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('rounded-md');
    expect(alert).toHaveClass('p-4');
    expect(alert).toHaveClass('custom-class');
  });
});
