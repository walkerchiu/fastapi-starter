import type { Meta, StoryObj } from '@storybook/react';
import { Card, Row, Col, Typography, Button, Table, Tag } from 'antd';
import {
  PlusOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { AdminDashboard } from './AdminDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const { Text } = Typography;

const meta: Meta<typeof AdminDashboard> = {
  title: 'Dashboard/Templates/AdminDashboard',
  component: AdminDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Dashboard Overview"
      description="Welcome to the admin dashboard"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]}
    />
    <PageContent>
      <PageSection title="Quick Stats">
        <Row gutter={[16, 16]}>
          {[
            { label: 'Total Users', value: '1,234' },
            { label: 'Active Sessions', value: '56' },
            { label: 'Total Files', value: '789' },
            { label: 'System Health', value: '99.9%' },
          ].map((stat) => (
            <Col xs={24} sm={12} lg={6} key={stat.label}>
              <Card size="small">
                <Text type="secondary">{stat.label}</Text>
                <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>
                  {stat.value}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </PageSection>
    </PageContent>
  </>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    activeMenuKey: 'dashboard',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Administrator',
    },
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    activeMenuKey: 'dashboard',
  },
};

export const WithAvatar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'Admin',
      avatar: 'https://i.pravatar.cc/150?u=admin',
    },
    activeMenuKey: 'dashboard',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'dashboard',
  },
};

export const WithExtendedMenu: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    menuExtend: [
      {
        key: 'custom-group',
        label: 'Custom',
        items: [
          {
            key: 'reports',
            label: 'Reports',
            href: '/admin/reports',
            icon: <BarChartOutlined />,
          },
          {
            key: 'analytics',
            label: 'Analytics',
            href: '/admin/analytics',
            icon: <LineChartOutlined />,
          },
        ],
      },
    ],
    activeMenuKey: 'dashboard',
  },
};

export const WithCustomFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    footerCopyright: '© 2024 My Company. All rights reserved.',
    footerLinks: [
      { label: 'API Docs', href: '/api-docs' },
      { label: 'Status', href: '/status' },
      { label: 'Changelog', href: '/changelog' },
    ],
    activeMenuKey: 'dashboard',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    showFooter: false,
    activeMenuKey: 'dashboard',
  },
};

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'Active' ? 'success' : 'default'}>{status}</Tag>
    ),
  },
];

const dataSource = [
  {
    key: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    key: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'User',
    status: 'Active',
  },
  {
    key: '3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    role: 'User',
    status: 'Inactive',
  },
];

export const UsersPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Users"
          description="Manage user accounts"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'User Management', href: '/admin/users' },
            { label: 'Users' },
          ]}
          actions={
            <Button type="primary" icon={<PlusOutlined />}>
              Add User
            </Button>
          }
        />
        <PageContent>
          <PageSection>
            <Card>
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
              />
            </Card>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    activeMenuKey: 'users',
  },
};
