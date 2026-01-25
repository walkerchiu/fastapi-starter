import type { Meta, StoryObj } from '@storybook/react';
import { HealthStatus } from './HealthStatus';

const meta: Meta<typeof HealthStatus> = {
  title: 'Admin/HealthStatus',
  component: HealthStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HealthStatus>;

export const Healthy: Story = {
  args: {
    status: {
      overall: 'healthy',
      lastChecked: new Date(),
      components: [
        { name: 'Database', status: 'healthy', latency: 12 },
        { name: 'Cache (Redis)', status: 'healthy', latency: 3 },
        { name: 'Message Queue', status: 'healthy', latency: 8 },
        { name: 'Storage (S3)', status: 'healthy', latency: 45 },
        { name: 'Email Service', status: 'healthy', latency: 120 },
      ],
    },
  },
};

export const Degraded: Story = {
  args: {
    status: {
      overall: 'degraded',
      lastChecked: new Date(),
      components: [
        { name: 'Database', status: 'healthy', latency: 15 },
        { name: 'Cache (Redis)', status: 'healthy', latency: 5 },
        {
          name: 'Message Queue',
          status: 'degraded',
          latency: 850,
          message: 'High latency',
        },
        { name: 'Storage (S3)', status: 'healthy', latency: 48 },
        { name: 'Email Service', status: 'healthy', latency: 95 },
      ],
    },
  },
};

export const Unhealthy: Story = {
  args: {
    status: {
      overall: 'unhealthy',
      lastChecked: new Date(),
      components: [
        { name: 'Database', status: 'healthy', latency: 18 },
        {
          name: 'Cache (Redis)',
          status: 'unhealthy',
          message: 'Connection refused',
        },
        { name: 'Message Queue', status: 'degraded', latency: 1200 },
        { name: 'Storage (S3)', status: 'healthy', latency: 52 },
        { name: 'Email Service', status: 'unknown' },
      ],
    },
  },
};

export const Loading: Story = {
  args: {
    status: {
      overall: 'healthy',
      components: [],
    },
    loading: true,
  },
};

export const MinimalComponents: Story = {
  args: {
    status: {
      overall: 'healthy',
      components: [
        { name: 'API', status: 'healthy', latency: 25 },
        { name: 'Database', status: 'healthy', latency: 10 },
      ],
    },
  },
};

export const WithMessages: Story = {
  args: {
    status: {
      overall: 'degraded',
      lastChecked: new Date(),
      components: [
        {
          name: 'Database',
          status: 'healthy',
          latency: 12,
          message: 'Primary',
        },
        {
          name: 'Database Replica',
          status: 'degraded',
          latency: 250,
          message: 'Replication lag',
        },
        { name: 'Cache', status: 'healthy', latency: 2 },
        {
          name: 'Search',
          status: 'healthy',
          latency: 35,
          message: 'Elasticsearch',
        },
        { name: 'CDN', status: 'healthy', latency: 15, message: 'CloudFront' },
      ],
    },
  },
};
