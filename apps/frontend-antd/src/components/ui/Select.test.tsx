import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Select } from './Select';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders select correctly', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders placeholder', () => {
    render(<Select options={options} placeholder="Choose an option" />);
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Select options={options} disabled />);
    const selectWrapper = document.querySelector('.ant-select');
    expect(selectWrapper).toHaveClass('ant-select-disabled');
  });

  it('accepts custom className', () => {
    render(<Select options={options} className="custom-class" />);
    const select = document.querySelector('.ant-select');
    expect(select).toHaveClass('custom-class');
  });

  it('accepts onChange handler', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
