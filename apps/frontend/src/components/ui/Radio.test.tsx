import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Radio, RadioGroup } from './Radio';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  {
    value: 'option2',
    label: 'Option 2',
    description: 'Description for option 2',
  },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Radio', () => {
  it('renders radio element', () => {
    render(<Radio />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Radio label="Email notifications" />);
    expect(screen.getByLabelText('Email notifications')).toBeInTheDocument();
  });

  it('generates unique id and links label to radio', () => {
    render(<Radio label="Push notifications" />);
    const radio = screen.getByLabelText('Push notifications');
    expect(radio).toHaveAttribute('id');
  });

  it('uses provided id when given', () => {
    render(<Radio id="custom-id" label="Custom" />);
    expect(screen.getByLabelText('Custom')).toHaveAttribute('id', 'custom-id');
  });

  it('renders description when provided', () => {
    render(<Radio description="You will receive notifications via email" />);
    expect(
      screen.getByText('You will receive notifications via email'),
    ).toBeInTheDocument();
  });

  it('renders label and description together', () => {
    render(<Radio label="SMS" description="Receive text messages" />);
    expect(screen.getByLabelText('SMS')).toBeInTheDocument();
    expect(screen.getByText('Receive text messages')).toBeInTheDocument();
  });

  it('sets aria-describedby for description', () => {
    render(<Radio id="test-radio" description="Description" />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('aria-describedby', 'test-radio-description');
  });

  it('accepts custom className', () => {
    render(<Radio className="custom-class" />);
    expect(screen.getByRole('radio')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Radio ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Radio onChange={handleChange} />);
    fireEvent.click(screen.getByRole('radio'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('supports checked state', () => {
    render(<Radio checked onChange={() => {}} />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('supports disabled state', () => {
    render(<Radio disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('has correct base styles', () => {
    render(<Radio />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveClass('h-4');
    expect(radio).toHaveClass('w-4');
  });
});

describe('RadioGroup', () => {
  it('renders all radio options', () => {
    render(<RadioGroup name="test" options={mockOptions} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('renders legend when label is provided', () => {
    render(
      <RadioGroup
        name="notifications"
        label="Notification method"
        options={mockOptions}
      />,
    );
    expect(screen.getByText('Notification method')).toBeInTheDocument();
  });

  it('renders radiogroup role', () => {
    render(<RadioGroup name="test" options={mockOptions} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders option labels correctly', () => {
    render(<RadioGroup name="test" options={mockOptions} />);
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('renders option descriptions when provided', () => {
    render(<RadioGroup name="test" options={mockOptions} />);
    expect(screen.getByText('Description for option 2')).toBeInTheDocument();
  });

  it('checks the radio matching the value prop', () => {
    render(<RadioGroup name="test" options={mockOptions} value="option2" />);
    expect(screen.getByLabelText('Option 2')).toBeChecked();
  });

  it('disables individual options when specified', () => {
    render(<RadioGroup name="test" options={mockOptions} />);
    expect(screen.getByLabelText('Option 3')).toBeDisabled();
  });

  it('calls onChange with selected value', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup name="test" options={mockOptions} onChange={handleChange} />,
    );
    fireEvent.click(screen.getByLabelText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('displays error message when error prop is provided', () => {
    render(
      <RadioGroup
        name="test"
        options={mockOptions}
        error="Please select an option"
      />,
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('sets aria-invalid on radiogroup when error is present', () => {
    render(<RadioGroup name="test" options={mockOptions} error="Error" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('sets aria-describedby for error', () => {
    render(<RadioGroup name="test" options={mockOptions} error="Error" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-describedby');
  });

  it('accepts custom className', () => {
    render(
      <RadioGroup name="test" options={mockOptions} className="custom-class" />,
    );
    const fieldset = screen.getByRole('group');
    expect(fieldset).toHaveClass('custom-class');
  });

  it('all radios share the same name', () => {
    render(<RadioGroup name="shared-name" options={mockOptions} />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute('name', 'shared-name');
    });
  });
});
