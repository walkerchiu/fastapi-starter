import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('generates unique id and links label to input', () => {
    render(<Input label="Username" />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id');
  });

  it('uses provided id when given', () => {
    render(<Input id="custom-id" label="Custom" />);
    expect(screen.getByLabelText('Custom')).toHaveAttribute('id', 'custom-id');
  });

  it('displays error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<Input error="Error" />);
    // MUI TextField displays error helper text
    const helperText = screen.getByText('Error');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('MuiFormHelperText-root');
    expect(helperText).toHaveClass('Mui-error');
  });

  it('displays hint message when provided', () => {
    render(<Input hint="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('hides hint when error is displayed', () => {
    render(<Input hint="Helpful hint" error="Error message" />);
    // MUI TextField shows error as helperText, replacing hint
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('has helper text when error is provided', () => {
    render(<Input id="test-input" error="Error" />);
    const helperText = screen.getByText('Error');
    expect(helperText).toHaveClass('MuiFormHelperText-root');
  });

  it('has helper text when hint is provided', () => {
    render(<Input id="test-input" hint="Hint" />);
    const helperText = screen.getByText('Hint');
    expect(helperText).toHaveClass('MuiFormHelperText-root');
  });

  it('accepts custom className on TextField', () => {
    render(<Input className="custom-class" />);
    const formControl = document.querySelector('.MuiFormControl-root');
    expect(formControl).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    });
    expect(handleChange).toHaveBeenCalled();
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');
  });

  it('supports placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('supports required attribute', () => {
    render(<Input required label="Required Field" />);
    expect(screen.getByLabelText(/Required Field/)).toBeRequired();
  });

  it('supports disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('has MUI TextField base styles', () => {
    render(<Input />);
    const textField = document.querySelector('.MuiTextField-root');
    expect(textField).toBeInTheDocument();
    expect(textField).toHaveClass('MuiFormControl-fullWidth');
  });
});
