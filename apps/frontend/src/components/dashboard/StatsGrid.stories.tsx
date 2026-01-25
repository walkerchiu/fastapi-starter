import type { Meta, StoryObj } from '@storybook/react';
import { StatsGrid } from './StatsGrid';

const meta: Meta<typeof StatsGrid> = {
  title: 'Dashboard/Display/StatsGrid',
  component: StatsGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof StatsGrid>;

const UsersIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const FolderIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const ServerIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
    />
  </svg>
);

const sampleStats = [
  {
    title: 'Total Users',
    value: '2,543',
    icon: <UsersIcon />,
    change: { value: 12, trend: 'up' as const },
    href: '/admin/users',
  },
  {
    title: 'Total Files',
    value: '1,234',
    icon: <FolderIcon />,
    change: { value: 8, trend: 'up' as const },
  },
  {
    title: 'Active Sessions',
    value: '189',
    icon: <ChartIcon />,
    change: { value: 3, trend: 'down' as const },
  },
  {
    title: 'Storage Used',
    value: '45.2 GB',
    icon: <ServerIcon />,
    change: { value: 15, trend: 'up' as const },
  },
];

export const Default: Story = {
  args: {
    stats: sampleStats,
  },
};

export const ThreeColumns: Story = {
  args: {
    stats: sampleStats.slice(0, 3),
    columns: 3,
  },
};

export const TwoColumns: Story = {
  args: {
    stats: sampleStats.slice(0, 2),
    columns: 2,
  },
};

export const Loading: Story = {
  args: {
    stats: [],
    loading: true,
    columns: 4,
  },
};

export const WithoutChanges: Story = {
  args: {
    stats: [
      { title: 'Total Users', value: '2,543', icon: <UsersIcon /> },
      { title: 'Total Files', value: '1,234', icon: <FolderIcon /> },
      { title: 'Active Sessions', value: '189', icon: <ChartIcon /> },
      { title: 'Storage Used', value: '45.2 GB', icon: <ServerIcon /> },
    ],
  },
};

export const WithoutIcons: Story = {
  args: {
    stats: [
      {
        title: 'Revenue',
        value: '$45,231',
        change: { value: 20, trend: 'up' as const },
      },
      {
        title: 'Orders',
        value: '1,234',
        change: { value: 10, trend: 'up' as const },
      },
      {
        title: 'Customers',
        value: '567',
        change: { value: 5, trend: 'down' as const },
      },
      {
        title: 'Products',
        value: '89',
        change: { value: 2, trend: 'up' as const },
      },
    ],
  },
};
