import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DropdownMenu } from './DropdownMenu';

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'share', label: 'Share' },
];

describe('DropdownMenu', () => {
  it('renders trigger correctly', () => {
    render(<DropdownMenu items={items} trigger={<button>Open Menu</button>} />);
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('shows menu items when clicked', async () => {
    render(<DropdownMenu items={items} trigger={<button>Open Menu</button>} />);
    fireEvent.click(screen.getByText('Open Menu'));
    // Note: Ant Design dropdown renders in portal, so we need to wait for it
    expect(await screen.findByText('Edit')).toBeInTheDocument();
  });

  it('calls onClick when item is clicked', async () => {
    const handleClick = vi.fn();
    const itemsWithClick = items.map((item) => ({
      ...item,
      onClick: handleClick,
    }));
    render(
      <DropdownMenu
        items={itemsWithClick}
        trigger={<button>Open Menu</button>}
      />,
    );
    fireEvent.click(screen.getByText('Open Menu'));
    const editItem = await screen.findByText('Edit');
    fireEvent.click(editItem);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders divider items', async () => {
    const itemsWithDivider = [
      { key: 'edit', label: 'Edit' },
      { type: 'divider' as const },
      { key: 'delete', label: 'Delete' },
    ];
    render(
      <DropdownMenu
        items={itemsWithDivider}
        trigger={<button>Open Menu</button>}
      />,
    );
    fireEvent.click(screen.getByText('Open Menu'));
    expect(await screen.findByText('Edit')).toBeInTheDocument();
  });
});
