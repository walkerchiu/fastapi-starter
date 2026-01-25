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
    // MUI Alert uses severity classes
    expect(alert).toHaveClass('MuiAlert-standardInfo');
  });

  it('applies error variant styles', () => {
    render(<Alert variant="error">Error message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardError');
  });

  it('applies success variant styles', () => {
    render(<Alert variant="success">Success message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardSuccess');
  });

  it('applies warning variant styles', () => {
    render(<Alert variant="warning">Warning message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardWarning');
  });

  it('applies info variant styles explicitly', () => {
    render(<Alert variant="info">Info message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardInfo');
  });

  it('accepts custom className', () => {
    render(<Alert className="custom-class">Message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('preserves base MUI Alert styles with custom className', () => {
    render(<Alert className="custom-class">Message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-root');
    expect(alert).toHaveClass('custom-class');
  });
});
