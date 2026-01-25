import type { Meta, StoryObj } from '@storybook/react';
import { DashboardHeader } from './DashboardHeader';
import { Button } from '../ui/Button';
import { Avatar, Badge, Space, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Logo = () => (
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
);

const UserAvatar = () => <Avatar size="small">JD</Avatar>;

const meta: Meta<typeof DashboardHeader> = {
  title: 'Dashboard/DashboardHeader',
  component: DashboardHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    onMenuToggle: () => {},
  },
};

export const WithLogo: Story = {
  args: {
    logo: <Logo />,
    onMenuToggle: () => {},
  },
};

export const WithSearch: Story = {
  args: {
    logo: <Logo />,
    showSearch: true,
    searchPlaceholder: 'Search...',
    onSearch: (query) => console.log('Search:', query),
    onMenuToggle: () => {},
  },
};

export const WithActions: Story = {
  args: {
    logo: <Logo />,
    onMenuToggle: () => {},
    actions: (
      <>
        <Badge count={4} size="small">
          <Button variant="ghost" size="sm">
            <BellOutlined />
          </Button>
        </Badge>
        <UserAvatar />
      </>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    logo: <Logo />,
    showSearch: true,
    searchPlaceholder: 'Search anything...',
    onSearch: (query) => console.log('Search:', query),
    onMenuToggle: () => {},
    actions: (
      <>
        <Badge count={4} size="small">
          <Button variant="ghost" size="sm">
            <BellOutlined />
          </Button>
        </Badge>
        <Button size="sm" variant="primary">
          New Project
        </Button>
        <UserAvatar />
      </>
    ),
  },
};

export const NoMenuToggle: Story = {
  args: {
    logo: <Logo />,
    showMenuToggle: false,
    actions: <UserAvatar />,
  },
};

export const NotSticky: Story = {
  args: {
    logo: <Logo />,
    sticky: false,
    onMenuToggle: () => {},
  },
};
