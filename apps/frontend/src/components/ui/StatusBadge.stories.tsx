import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'pending', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showDot: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'active',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusBadge status="active" />
      <StatusBadge status="inactive" />
      <StatusBadge status="pending" />
      <StatusBadge status="error" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusBadge status="active" size="sm" />
      <StatusBadge status="active" size="md" />
      <StatusBadge status="active" size="lg" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusBadge status="active" label="Online" />
      <StatusBadge status="inactive" label="Offline" />
      <StatusBadge status="pending" label="Processing" />
      <StatusBadge status="error" label="Failed" />
    </div>
  ),
};

export const WithoutDot: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusBadge status="active" showDot={false} />
      <StatusBadge status="inactive" showDot={false} />
      <StatusBadge status="pending" showDot={false} />
      <StatusBadge status="error" showDot={false} />
    </div>
  ),
};

export const Active: Story = {
  args: {
    status: 'active',
  },
};

export const Inactive: Story = {
  args: {
    status: 'inactive',
  },
};

export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};
