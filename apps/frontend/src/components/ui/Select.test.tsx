import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Select } from './Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  it('renders select element', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select options={mockOptions} />);
    expect(
      screen.getByRole('option', { name: 'Option 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Option 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Option 3' }),
    ).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select label="Country" options={mockOptions} />);
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });

  it('generates unique id and links label to select', () => {
    render(<Select label="Category" options={mockOptions} />);
    const select = screen.getByLabelText('Category');
    expect(select).toHaveAttribute('id');
  });

  it('uses provided id when given', () => {
    render(<Select id="custom-id" label="Custom" options={mockOptions} />);
    expect(screen.getByLabelText('Custom')).toHaveAttribute('id', 'custom-id');
  });

  it('renders placeholder option when provided', () => {
    render(<Select options={mockOptions} placeholder="Select an option" />);
    const placeholder = screen.getByRole('option', {
      name: 'Select an option',
    });
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toBeDisabled();
  });

  it('displays error message when error prop is provided', () => {
    render(<Select options={mockOptions} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<Select options={mockOptions} error="Error" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('ring-red-300');
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays hint message when provided', () => {
    render(
      <Select options={mockOptions} hint="Choose your preferred option" />,
    );
    expect(
      screen.getByText('Choose your preferred option'),
    ).toBeInTheDocument();
  });

  it('hides hint when error is displayed', () => {
    render(
      <Select
        options={mockOptions}
        hint="Helpful hint"
        error="Error message"
      />,
    );
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('sets aria-describedby for error', () => {
    render(<Select id="test-select" options={mockOptions} error="Error" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
  });

  it('sets aria-describedby for hint', () => {
    render(<Select id="test-select" options={mockOptions} hint="Hint" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-describedby', 'test-select-hint');
  });

  it('accepts custom className', () => {
    render(<Select options={mockOptions} className="custom-class" />);
    expect(screen.getByRole('combobox')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Select ref={ref} options={mockOptions} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'option2' },
    });
    expect(handleChange).toHaveBeenCalled();
  });

  it('disables individual options when specified', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeDisabled();
  });

  it('supports disabled state', () => {
    render(<Select options={mockOptions} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('supports required attribute', () => {
    render(<Select options={mockOptions} required label="Required Field" />);
    expect(screen.getByLabelText('Required Field')).toBeRequired();
  });
});
