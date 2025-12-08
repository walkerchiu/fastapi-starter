import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Total Users',
    value: '12,345',
  },
};

export const WithNumber: Story = {
  args: {
    title: 'Revenue',
    value: '$54,321.00',
  },
};

export const WithPercentage: Story = {
  args: {
    title: 'Growth Rate',
    value: '+24.5%',
    valueClassName: 'text-3xl font-bold text-green-600 dark:text-green-400',
  },
};

export const NegativeValue: Story = {
  args: {
    title: 'Bounce Rate',
    value: '-12.3%',
    valueClassName: 'text-3xl font-bold text-red-600 dark:text-red-400',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Active Sessions',
    value: (
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          1,234
        </span>
        <svg
          className="h-6 w-6 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
    ),
  },
};

export const DashboardStats: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Users" value="12,345" />
      <StatCard title="Active Sessions" value="1,234" />
      <StatCard
        title="Revenue"
        value="$54,321"
        valueClassName="text-3xl font-bold text-green-600 dark:text-green-400"
      />
      <StatCard
        title="Conversion Rate"
        value="3.24%"
        valueClassName="text-3xl font-bold text-blue-600 dark:text-blue-400"
      />
    </div>
  ),
};

export const WithTrend: Story = {
  render: () => (
    <StatCard
      title="Monthly Revenue"
      value={
        <div>
          <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            $12,345
          </span>
          <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
            +12.5% from last month
          </span>
        </div>
      }
    />
  ),
};

export const CompactGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <StatCard title="Views" value="45.2K" />
      <StatCard title="Likes" value="12.8K" />
      <StatCard title="Shares" value="3.2K" />
      <StatCard title="Comments" value="891" />
      <StatCard title="Saves" value="2.1K" />
      <StatCard title="Engagement" value="8.4%" />
    </div>
  ),
};
