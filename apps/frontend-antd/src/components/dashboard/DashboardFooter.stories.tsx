import type { Meta, StoryObj } from '@storybook/react';
import { DashboardFooter } from './DashboardFooter';
import { Space, Typography } from 'antd';
import { TwitterOutlined, GithubOutlined } from '@ant-design/icons';

const { Text } = Typography;

const meta: Meta<typeof DashboardFooter> = {
  title: 'Dashboard/DashboardFooter',
  component: DashboardFooter,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomCopyright: Story = {
  args: {
    copyright: '© 2025 My Company. All rights reserved.',
  },
};

export const WithLinks: Story = {
  args: {
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const FullFeatured: Story = {
  args: {
    copyright: '© 2025 Acme Inc. All rights reserved.',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
      { label: 'Help', href: '/help' },
    ],
  },
};

export const CustomContent: Story = {
  args: {
    children: (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: '#1677ff',
            }}
          />
          <Text strong>Acme Inc</Text>
        </Space>
        <Text type="secondary">Made with love by the Acme team</Text>
        <Space>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(0, 0, 0, 0.45)' }}
          >
            <TwitterOutlined style={{ fontSize: 18 }} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(0, 0, 0, 0.45)' }}
          >
            <GithubOutlined style={{ fontSize: 18 }} />
          </a>
        </Space>
      </div>
    ),
  },
};
