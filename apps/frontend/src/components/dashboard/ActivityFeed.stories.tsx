import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFeed } from './ActivityFeed';
import { Card, CardHeader, CardBody } from '../ui/Card';

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
    timestamp: new Date(now.getTime() - 5 * 60000), // 5 minutes ago
  },
  {
    id: '2',
    user: { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    action: 'updated settings for',
    target: 'Email notifications',
    timestamp: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
  },
  {
    id: '3',
    user: { name: 'Bob Wilson' },
    action: 'uploaded 3 files to',
    target: 'Documents',
    timestamp: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
  },
  {
    id: '4',
    user: { name: 'Alice Brown', avatar: 'https://i.pravatar.cc/150?u=alice' },
    action: 'deleted user',
    target: 'inactive@example.com',
    timestamp: new Date(now.getTime() - 24 * 3600000), // 1 day ago
  },
  {
    id: '5',
    user: { name: 'System' },
    action: 'performed scheduled backup',
    timestamp: new Date(now.getTime() - 3 * 24 * 3600000), // 3 days ago
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
        />
      </svg>
    ),
  },
];

export const Default: Story = {
  args: {
    items: sampleActivities,
  },
};

export const InCard: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-4">
          <ActivityFeed items={sampleActivities} />
        </div>
      </CardBody>
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
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
        ),
      },
      {
        id: '2',
        user: { name: 'Alert' },
        action: 'High memory usage detected',
        target: 'Server 1',
        timestamp: new Date(now.getTime() - 15 * 60000),
        icon: (
          <svg
            className="h-4 w-4 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
      },
      {
        id: '3',
        user: { name: 'Cron' },
        action: 'Scheduled task executed',
        target: 'cleanup-old-files',
        timestamp: new Date(now.getTime() - 60 * 60000),
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    ],
  },
};
