import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tabs } from './Tabs';

const items = [
  { key: 'tab1', label: 'Tab 1', children: 'Content 1' },
  { key: 'tab2', label: 'Tab 2', children: 'Content 2' },
  { key: 'tab3', label: 'Tab 3', children: 'Content 3' },
];

describe('Tabs', () => {
  it('renders tabs correctly', () => {
    render(<Tabs items={items} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('renders first tab content by default', () => {
    render(<Tabs items={items} />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('switches tab content when clicked', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('calls onChange when tab is changed', () => {
    const handleChange = vi.fn();
    render(<Tabs items={items} onChange={handleChange} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('renders with active tab', () => {
    render(<Tabs items={items} activeKey="tab2" />);
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });
});
