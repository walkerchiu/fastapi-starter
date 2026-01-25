import type { Meta, StoryObj } from '@storybook/react';
import { DashboardSidebar } from './DashboardSidebar';
import { Avatar, Typography, Space } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  SettingOutlined,
  FolderOutlined,
  BellOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const sampleItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeOutlined />,
    href: '/dashboard',
  },
  {
    key: 'users',
    label: 'Users',
    icon: <TeamOutlined />,
    children: [
      { key: 'users-list', label: 'User List', href: '/users' },
      { key: 'users-roles', label: 'Roles', href: '/users/roles' },
      {
        key: 'users-permissions',
        label: 'Permissions',
        href: '/users/permissions',
      },
    ],
  },
  {
    key: 'files',
    label: 'Files',
    icon: <FolderOutlined />,
    href: '/files',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <BellOutlined />,
    href: '/notifications',
    badge: 5,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    href: '/settings',
    disabled: true,
  },
];

const groupedItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeOutlined />,
    href: '/dashboard',
  },
  {
    key: 'management-group',
    label: 'Management',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: <TeamOutlined />,
        href: '/users',
      },
      {
        key: 'files',
        label: 'Files',
        icon: <FolderOutlined />,
        href: '/files',
      },
    ],
  },
  {
    key: 'system-group',
    label: 'System',
    items: [
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingOutlined />,
        href: '/settings',
      },
      {
        key: 'notifications',
        label: 'Notifications',
        icon: <BellOutlined />,
        href: '/notifications',
        badge: 3,
      },
    ],
  },
];

const meta: Meta<typeof DashboardSidebar> = {
  title: 'Dashboard/DashboardSidebar',
  component: DashboardSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    onCollapse: undefined,
  },
};

export const Collapsed: Story = {
  args: {
    items: sampleItems,
    collapsed: true,
    activeKey: 'dashboard',
  },
};

export const WithGroups: Story = {
  args: {
    items: groupedItems,
    activeKey: 'users',
  },
};

export const NestedMenu: Story = {
  args: {
    items: sampleItems,
    activeKey: 'users-list',
  },
};

export const WithBadges: Story = {
  args: {
    items: sampleItems,
    activeKey: 'notifications',
  },
};

export const WithHeader: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    header: (
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
    ),
  },
};

export const WithFooter: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    footer: (
      <Space style={{ width: '100%' }}>
        <Avatar size="small">JD</Avatar>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Text strong style={{ display: 'block', fontSize: 13 }} ellipsis>
            John Doe
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            john@example.com
          </Text>
        </div>
      </Space>
    ),
  },
};

export const WithCollapseControl: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    onCollapse: () => {},
    header: (
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
    ),
  },
};
