import type { Meta, StoryObj } from '@storybook/react';
import { StatsGrid } from './StatsGrid';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorageIcon from '@mui/icons-material/Storage';

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

const sampleStats = [
  {
    title: 'Total Users',
    value: '2,543',
    icon: <PeopleIcon />,
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
    icon: <BarChartIcon />,
    change: { value: 3, trend: 'down' as const },
  },
  {
    title: 'Storage Used',
    value: '45.2 GB',
    icon: <StorageIcon />,
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
      { title: 'Total Users', value: '2,543', icon: <PeopleIcon /> },
      { title: 'Total Files', value: '1,234', icon: <FolderIcon /> },
      { title: 'Active Sessions', value: '189', icon: <BarChartIcon /> },
      { title: 'Storage Used', value: '45.2 GB', icon: <StorageIcon /> },
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
