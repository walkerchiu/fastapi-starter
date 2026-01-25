import type { Meta, StoryObj } from '@storybook/react';
import { AdminLayout } from './AdminLayout';
import { Button, Typography } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const meta: Meta<typeof AdminLayout> = {
  title: 'Admin/AdminLayout',
  component: AdminLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdminLayout>;

const sampleSidebarItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'users', label: 'Users', href: '/admin/users' },
  { key: 'settings', label: 'Settings', href: '/admin/settings' },
];

export const Default: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    children: (
      <div style={{ padding: 24 }}>
        <Title level={4}>Dashboard Content</Title>
        <Paragraph type="secondary">
          This is the main content area of the admin layout.
        </Paragraph>
      </div>
    ),
  },
};

export const WithQuickActions: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    showQuickActions: true,
    quickActions: (
      <>
        <Button type="primary" size="small" icon={<PlusOutlined />}>
          Add User
        </Button>
        <Button size="small" icon={<ReloadOutlined />}>
          Refresh
        </Button>
        <Button size="small" icon={<SettingOutlined />}>
          Settings
        </Button>
      </>
    ),
    children: (
      <div style={{ padding: 24 }}>
        <Title level={4}>Dashboard with Quick Actions</Title>
        <Paragraph type="secondary">
          The quick actions bar appears above the content.
        </Paragraph>
      </div>
    ),
  },
};

export const WithoutQuickActions: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'users',
    showQuickActions: false,
    children: (
      <div style={{ padding: 24 }}>
        <Title level={4}>Users Management</Title>
        <Paragraph type="secondary">
          Quick actions are hidden in this view.
        </Paragraph>
      </div>
    ),
  },
};
