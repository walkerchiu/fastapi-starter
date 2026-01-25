import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline';
import { Card, CardHeader, CardBody } from '../ui/Card';

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
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
  {
    id: '2',
    title: 'Payment confirmed',
    description: 'Payment of $99.00 has been received.',
    timestamp: new Date(now.getTime() - 3 * 24 * 3600000),
    status: 'success' as const,
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
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    id: '3',
    title: 'Shipped',
    description: 'Your package has been shipped via Express Delivery.',
    timestamp: new Date(now.getTime() - 2 * 24 * 3600000),
    status: 'success' as const,
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
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
  {
    id: '4',
    title: 'Out for delivery',
    description: 'Your package is out for delivery and will arrive today.',
    timestamp: new Date(now.getTime() - 1 * 3600000),
    status: 'info' as const,
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
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
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
    <Card className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold">Order Status</h3>
      </CardHeader>
      <CardBody>
        <Timeline items={orderTimeline} />
      </CardBody>
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
