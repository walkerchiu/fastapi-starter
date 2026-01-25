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
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: 'Total Users',
    value: 12345,
  },
};

export const WithPrefix: Story = {
  args: {
    title: 'Revenue',
    value: 45678,
    prefix: '$',
  },
};

export const WithSuffix: Story = {
  args: {
    title: 'Growth Rate',
    value: 23.5,
    suffix: '%',
  },
};

export const WithTrendUp: Story = {
  args: {
    title: 'Monthly Revenue',
    value: 125000,
    prefix: '$',
    trend: 'up',
    trendValue: '12%',
  },
};

export const WithTrendDown: Story = {
  args: {
    title: 'Bounce Rate',
    value: 34,
    suffix: '%',
    trend: 'down',
    trendValue: '5%',
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Data',
    value: 0,
    loading: true,
  },
};

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Users" value={12345} trend="up" trendValue="8%" />
      <StatCard
        title="Revenue"
        value={89234}
        prefix="$"
        trend="up"
        trendValue="12%"
      />
      <StatCard title="Orders" value={432} trend="down" trendValue="3%" />
      <StatCard
        title="Conversion"
        value={3.2}
        suffix="%"
        trend="up"
        trendValue="0.5%"
      />
    </div>
  ),
};
