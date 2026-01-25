import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders checkbox element', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('generates unique id and links label to checkbox', () => {
    render(<Checkbox label="Newsletter" />);
    const checkbox = screen.getByLabelText('Newsletter');
    expect(checkbox).toHaveAttribute('id');
  });

  it('uses provided id when given', () => {
    render(<Checkbox id="custom-id" label="Custom" />);
    expect(screen.getByLabelText('Custom')).toHaveAttribute('id', 'custom-id');
  });

  it('renders description when provided', () => {
    render(
      <Checkbox
        label="Subscribe"
        description="You will receive weekly updates"
      />,
    );
    expect(
      screen.getByText('You will receive weekly updates'),
    ).toBeInTheDocument();
  });

  it('renders label and description together', () => {
    render(
      <Checkbox label="Subscribe" description="Get notified about updates" />,
    );
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
    expect(screen.getByText('Get notified about updates')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Checkbox error="You must accept the terms" />);
    expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<Checkbox error="Error" />);
    // Error message is displayed with error class
    const helperText = screen.getByText('Error');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('MuiFormHelperText-root');
    expect(helperText).toHaveClass('Mui-error');
  });

  it('hides description when error is displayed', () => {
    render(
      <Checkbox
        label="Subscribe"
        description="Helpful description"
        error="Error message"
      />,
    );
    expect(screen.queryByText('Helpful description')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('sets aria-describedby for error', () => {
    render(<Checkbox id="test-checkbox" error="Error" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-describedby', 'test-checkbox-error');
  });

  it('accepts custom className on FormControl', () => {
    render(<Checkbox className="custom-class" />);
    const formControl = document.querySelector('.MuiFormControl-root');
    expect(formControl).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Checkbox ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('supports checked state', () => {
    render(<Checkbox checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('supports disabled state', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('has MUI Checkbox base styles', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    // MUI Checkbox uses span with class
    const checkboxContainer = checkbox.closest('.MuiCheckbox-root');
    expect(checkboxContainer).toBeInTheDocument();
  });
});
