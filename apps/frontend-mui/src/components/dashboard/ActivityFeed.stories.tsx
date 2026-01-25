import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFeed } from './ActivityFeed';
import { Card, CardHeader, CardContent } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import WarningIcon from '@mui/icons-material/Warning';
import ScheduleIcon from '@mui/icons-material/Schedule';

const meta: Meta<typeof ActivityFeed> = {
  title: 'Dashboard/Display/ActivityFeed',
  component: ActivityFeed,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

const now = new Date();
const sampleActivities = [
  {
    id: '1',
    user: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    action: 'created a new user',
    target: 'jane@example.com',
    timestamp: new Date(now.getTime() - 5 * 60000),
  },
  {
    id: '2',
    user: { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    action: 'updated settings for',
    target: 'Email notifications',
    timestamp: new Date(now.getTime() - 30 * 60000),
  },
  {
    id: '3',
    user: { name: 'Bob Wilson' },
    action: 'uploaded 3 files to',
    target: 'Documents',
    timestamp: new Date(now.getTime() - 2 * 3600000),
  },
  {
    id: '4',
    user: { name: 'Alice Brown', avatar: 'https://i.pravatar.cc/150?u=alice' },
    action: 'deleted user',
    target: 'inactive@example.com',
    timestamp: new Date(now.getTime() - 24 * 3600000),
  },
  {
    id: '5',
    user: { name: 'System' },
    action: 'performed scheduled backup',
    timestamp: new Date(now.getTime() - 3 * 24 * 3600000),
    icon: <StorageIcon />,
  },
];

export const Default: Story = {
  args: {
    items: sampleActivities,
  },
};

export const InCard: Story = {
  render: () => (
    <Card sx={{ width: 400 }}>
      <CardHeader title="Recent Activity" />
      <CardContent sx={{ p: 0 }}>
        <ActivityFeed items={sampleActivities} />
      </CardContent>
    </Card>
  ),
};

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyText: 'No activity to show',
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        id: '1',
        user: { name: 'System' },
        action: 'Database backup completed',
        timestamp: new Date(),
        icon: <StorageIcon />,
      },
      {
        id: '2',
        user: { name: 'Alert' },
        action: 'High memory usage detected',
        target: 'Server 1',
        timestamp: new Date(now.getTime() - 15 * 60000),
        icon: <WarningIcon color="warning" />,
      },
      {
        id: '3',
        user: { name: 'Cron' },
        action: 'Scheduled task executed',
        target: 'cleanup-old-files',
        timestamp: new Date(now.getTime() - 60 * 60000),
        icon: <ScheduleIcon />,
      },
    ],
  },
};
