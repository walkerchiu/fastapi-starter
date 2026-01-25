import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const items = [
  {
    key: 'profile',
    label: 'Profile',
    children: (
      <div className="p-4">
        <h3 className="text-lg font-semibold">Profile Settings</h3>
        <p>Manage your profile information here.</p>
      </div>
    ),
  },
  {
    key: 'security',
    label: 'Security',
    children: (
      <div className="p-4">
        <h3 className="text-lg font-semibold">Security Settings</h3>
        <p>Configure your security preferences.</p>
      </div>
    ),
  },
  {
    key: 'notifications',
    label: 'Notifications',
    children: (
      <div className="p-4">
        <h3 className="text-lg font-semibold">Notification Settings</h3>
        <p>Manage your notification preferences.</p>
      </div>
    ),
  },
];

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    items,
  },
};

export const WithDefaultActive: Story = {
  args: {
    items,
    defaultActiveKey: 'security',
  },
};

export const Card: Story = {
  args: {
    items,
    type: 'card',
  },
};

export const Centered: Story = {
  args: {
    items,
    centered: true,
  },
};

export const WithDisabled: Story = {
  args: {
    items: [
      ...items.slice(0, 2),
      {
        key: 'disabled',
        label: 'Disabled',
        children: 'Disabled content',
        disabled: true,
      },
    ],
  },
};
