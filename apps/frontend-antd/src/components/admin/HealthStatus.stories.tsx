import type { Meta, StoryObj } from '@storybook/react';
import { HealthStatus, type HealthStatusData } from './HealthStatus';

const meta: Meta<typeof HealthStatus> = {
  title: 'Admin/HealthStatus',
  component: HealthStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HealthStatus>;

const healthyStatus: HealthStatusData = {
  overall: 'healthy',
  components: [
    { name: 'Database', status: 'healthy', latency: 5 },
    { name: 'Redis', status: 'healthy', latency: 2 },
    { name: 'API Gateway', status: 'healthy', latency: 15 },
    { name: 'Email Service', status: 'healthy', latency: 120 },
  ],
  lastChecked: new Date(),
};

const degradedStatus: HealthStatusData = {
  overall: 'degraded',
  components: [
    { name: 'Database', status: 'healthy', latency: 5 },
    {
      name: 'Redis',
      status: 'degraded',
      latency: 250,
      message: 'High latency',
    },
    { name: 'API Gateway', status: 'healthy', latency: 15 },
    { name: 'Email Service', status: 'healthy', latency: 120 },
  ],
  lastChecked: new Date(),
};

const unhealthyStatus: HealthStatusData = {
  overall: 'unhealthy',
  components: [
    { name: 'Database', status: 'unhealthy', message: 'Connection refused' },
    { name: 'Redis', status: 'unknown' },
    { name: 'API Gateway', status: 'healthy', latency: 15 },
    { name: 'Email Service', status: 'degraded', latency: 2500 },
  ],
  lastChecked: new Date(),
};

export const Healthy: Story = {
  args: {
    status: healthyStatus,
  },
};

export const Degraded: Story = {
  args: {
    status: degradedStatus,
  },
};

export const Unhealthy: Story = {
  args: {
    status: unhealthyStatus,
  },
};

export const Loading: Story = {
  args: {
    status: healthyStatus,
    loading: true,
  },
};

export const WithoutLastChecked: Story = {
  args: {
    status: {
      overall: 'healthy',
      components: [
        { name: 'Database', status: 'healthy', latency: 5 },
        { name: 'Redis', status: 'healthy', latency: 2 },
      ],
    },
  },
};
