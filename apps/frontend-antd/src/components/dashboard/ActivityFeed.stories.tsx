import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFeed } from './ActivityFeed';
import { Card, Typography } from 'antd';
import {
  DatabaseOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

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
    icon: <DatabaseOutlined style={{ fontSize: 14 }} />,
  },
];

export const Default: Story = {
  args: {
    items: sampleActivities,
  },
};

export const InCard: Story = {
  render: () => (
    <Card
      style={{ width: 384 }}
      title={
        <Title level={5} style={{ margin: 0 }}>
          Recent Activity
        </Title>
      }
    >
      <ActivityFeed items={sampleActivities} />
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
        icon: <DatabaseOutlined style={{ fontSize: 14 }} />,
      },
      {
        id: '2',
        user: { name: 'Alert' },
        action: 'High memory usage detected',
        target: 'Server 1',
        timestamp: new Date(now.getTime() - 15 * 60000),
        icon: <WarningOutlined style={{ fontSize: 14, color: '#faad14' }} />,
      },
      {
        id: '3',
        user: { name: 'Cron' },
        action: 'Scheduled task executed',
        target: 'cleanup-old-files',
        timestamp: new Date(now.getTime() - 60 * 60000),
        icon: <ClockCircleOutlined style={{ fontSize: 14 }} />,
      },
    ],
  },
};
