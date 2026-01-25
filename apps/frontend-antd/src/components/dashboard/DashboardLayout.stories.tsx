import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from './DashboardLayout';
import { PageHeader } from './PageHeader';
import { PageSection } from './PageSection';
import { Button } from '../ui/Button';
import { Avatar, Badge, Card, Row, Col, Space, Typography } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  SettingOutlined,
  FolderOutlined,
  BellOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

const sampleSidebarItems = [
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
    ],
  },
  {
    key: 'files',
    label: 'Files',
    icon: <FolderOutlined />,
    href: '/files',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    href: '/settings',
  },
];

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

const SamplePageContent = () => (
  <>
    <PageHeader
      title="Dashboard"
      description="Welcome back! Here's what's happening."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
      actions={
        <Button variant="primary" size="sm">
          Create New
        </Button>
      }
    />
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4].map((i) => (
        <Col key={i} xs={24} sm={12} lg={6}>
          <Card>
            <Text type="secondary">Stat {i}</Text>
            <Title level={3} style={{ margin: '8px 0 0' }}>
              {i * 1234}
            </Title>
          </Card>
        </Col>
      ))}
    </Row>
    <PageSection title="Recent Activity">
      <Space direction="vertical" style={{ width: '100%' }}>
        {[1, 2, 3].map((i) => (
          <Card key={i} size="small">
            <Space>
              <Avatar>{i}</Avatar>
              <div>
                <Text strong>Activity Item {i}</Text>
                <br />
                <Text type="secondary">Description of the activity</Text>
              </div>
            </Space>
          </Card>
        ))}
      </Space>
    </PageSection>
  </>
);

const meta: Meta<typeof DashboardLayout> = {
  title: 'Dashboard/DashboardLayout',
  component: DashboardLayout,
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
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    headerActions: (
      <>
        <Badge count={4} size="small">
          <Button variant="ghost" size="sm">
            <BellOutlined />
          </Button>
        </Badge>
        <UserAvatar />
      </>
    ),
    footerCopyright: '© 2025 Acme Inc. All rights reserved.',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
    children: <SamplePageContent />,
  },
};

export const WithoutSidebar: Story = {
  args: {
    showSidebar: false,
    headerLogo: <Logo />,
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const WithoutFooter: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    showFooter: false,
    children: <SamplePageContent />,
  },
};

export const Collapsed: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarCollapsed: true,
    headerLogo: <Logo />,
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const WithSearch: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const MinimalLayout: Story = {
  args: {
    showSidebar: false,
    showHeader: false,
    showFooter: false,
    children: (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Minimal Layout</Title>
          <Text type="secondary">No sidebar, header, or footer</Text>
        </div>
      </div>
    ),
  },
};
