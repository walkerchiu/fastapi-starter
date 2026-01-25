import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline';
import { Card, Typography } from 'antd';
import {
  CheckOutlined,
  CreditCardOutlined,
  InboxOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const meta: Meta<typeof Timeline> = {
  title: 'Dashboard/Display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const now = new Date();

const orderTimeline = [
  {
    id: '1',
    title: 'Order placed',
    description: 'Your order has been received and is being processed.',
    timestamp: new Date(now.getTime() - 4 * 24 * 3600000),
    status: 'success' as const,
    icon: <CheckOutlined />,
  },
  {
    id: '2',
    title: 'Payment confirmed',
    description: 'Payment of $99.00 has been received.',
    timestamp: new Date(now.getTime() - 3 * 24 * 3600000),
    status: 'success' as const,
    icon: <CreditCardOutlined />,
  },
  {
    id: '3',
    title: 'Shipped',
    description: 'Your package has been shipped via Express Delivery.',
    timestamp: new Date(now.getTime() - 2 * 24 * 3600000),
    status: 'success' as const,
    icon: <InboxOutlined />,
  },
  {
    id: '4',
    title: 'Out for delivery',
    description: 'Your package is out for delivery and will arrive today.',
    timestamp: new Date(now.getTime() - 1 * 3600000),
    status: 'info' as const,
    icon: <InfoCircleOutlined />,
  },
];

const auditLogTimeline = [
  {
    id: '1',
    title: 'User login',
    description: 'admin@example.com logged in from 192.168.1.1',
    timestamp: new Date(now.getTime() - 30 * 60000),
    status: 'success' as const,
  },
  {
    id: '2',
    title: 'Settings changed',
    description: 'Email notification settings were updated',
    timestamp: new Date(now.getTime() - 2 * 3600000),
    status: 'info' as const,
  },
  {
    id: '3',
    title: 'Failed login attempt',
    description: 'Invalid credentials for user@example.com',
    timestamp: new Date(now.getTime() - 5 * 3600000),
    status: 'warning' as const,
  },
  {
    id: '4',
    title: 'User deleted',
    description: 'inactive@example.com was permanently deleted',
    timestamp: new Date(now.getTime() - 24 * 3600000),
    status: 'error' as const,
  },
];

export const Default: Story = {
  args: {
    items: orderTimeline,
  },
};

export const AuditLog: Story = {
  args: {
    items: auditLogTimeline,
  },
};

export const InCard: Story = {
  render: () => (
    <Card
      style={{ width: 384 }}
      title={
        <Title level={5} style={{ margin: 0 }}>
          Order Status
        </Title>
      }
    >
      <Timeline items={orderTimeline} />
    </Card>
  ),
};

export const Simple: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Created',
        timestamp: new Date(now.getTime() - 7 * 24 * 3600000),
      },
      {
        id: '2',
        title: 'In Progress',
        timestamp: new Date(now.getTime() - 3 * 24 * 3600000),
      },
      {
        id: '3',
        title: 'Review',
        timestamp: new Date(now.getTime() - 1 * 24 * 3600000),
      },
      {
        id: '4',
        title: 'Completed',
        timestamp: new Date(),
        status: 'success' as const,
      },
    ],
  },
};
