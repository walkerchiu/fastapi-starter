import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from './DropdownMenu';
import { Button } from './Button';

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'duplicate', label: 'Duplicate' },
  { type: 'divider' as const },
  { key: 'archive', label: 'Archive' },
  { key: 'delete', label: 'Delete', danger: true },
];

const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    items,
    trigger: <Button>Open Menu</Button>,
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { key: 'edit', label: 'Edit' },
      { key: 'duplicate', label: 'Duplicate', disabled: true },
      { key: 'delete', label: 'Delete' },
    ],
    trigger: <Button>Open Menu</Button>,
  },
};

export const WithDanger: Story = {
  args: {
    items: [
      { key: 'edit', label: 'Edit' },
      { type: 'divider' as const },
      { key: 'delete', label: 'Delete', danger: true },
    ],
    trigger: <Button>Open Menu</Button>,
  },
};

export const PlacementOptions: Story = {
  render: () => (
    <div className="flex gap-4">
      <DropdownMenu
        items={items}
        placement="bottomLeft"
        trigger={<Button>Bottom Left</Button>}
      />
      <DropdownMenu
        items={items}
        placement="bottomCenter"
        trigger={<Button>Bottom Center</Button>}
      />
      <DropdownMenu
        items={items}
        placement="bottomRight"
        trigger={<Button>Bottom Right</Button>}
      />
    </div>
  ),
};
