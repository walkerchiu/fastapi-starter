import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Radio, RadioGroup } from './Radio';

describe('Radio', () => {
  it('renders radio correctly', () => {
    render(<Radio value="1" label="Option 1" />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Radio value="1" label="Disabled" disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  it('renders all options', () => {
    render(<RadioGroup options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<RadioGroup options={options} label="Select option" />);
    expect(screen.getByText('Select option')).toBeInTheDocument();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<RadioGroup options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByText('Option 2'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message when error prop is provided', () => {
    render(<RadioGroup options={options} error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });
});
