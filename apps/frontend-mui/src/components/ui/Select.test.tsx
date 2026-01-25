import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders all options when opened', async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
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

  it('renders placeholder option when provided', async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} placeholder="Select an option" />);

    // MUI Select shows placeholder in combobox when value is empty
    expect(screen.getByRole('combobox')).toHaveTextContent('Select an option');

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      const placeholderOption = screen.getByRole('option', {
        name: 'Select an option',
      });
      expect(placeholderOption).toBeInTheDocument();
      expect(placeholderOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('displays error message when error prop is provided', () => {
    render(<Select options={mockOptions} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<Select options={mockOptions} error="Error" />);
    // MUI Select displays error helper text
    const helperText = screen.getByText('Error');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('MuiFormHelperText-root');
    expect(helperText).toHaveClass('Mui-error');
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

  it('has helper text when error is provided', () => {
    render(<Select id="test-select" options={mockOptions} error="Error" />);
    const helperText = screen.getByText('Error');
    expect(helperText).toHaveClass('MuiFormHelperText-root');
  });

  it('has helper text when hint is provided', () => {
    render(<Select id="test-select" options={mockOptions} hint="Hint" />);
    const helperText = screen.getByText('Hint');
    expect(helperText).toHaveClass('MuiFormHelperText-root');
  });

  it('accepts custom className on TextField', () => {
    render(<Select options={mockOptions} className="custom-class" />);
    const formControl = document.querySelector('.MuiFormControl-root');
    expect(formControl).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Select ref={ref} options={mockOptions} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles value selection', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option 2' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Option 2' }));

    expect(handleChange).toHaveBeenCalled();
  });

  it('disables individual options when specified', async () => {
    const user = userEvent.setup();
    render(<Select options={mockOptions} />);

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      const disabledOption = screen.getByRole('option', { name: 'Option 3' });
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('supports disabled state', () => {
    render(<Select options={mockOptions} disabled />);
    const selectInput = document.querySelector('.MuiInputBase-input');
    expect(selectInput).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports required attribute', () => {
    render(<Select options={mockOptions} required label="Required Field" />);
    expect(screen.getByLabelText(/Required Field/)).toBeRequired();
  });

  it('has MUI Select base styles', () => {
    render(<Select options={mockOptions} />);
    const textField = document.querySelector('.MuiTextField-root');
    expect(textField).toBeInTheDocument();
  });
});
