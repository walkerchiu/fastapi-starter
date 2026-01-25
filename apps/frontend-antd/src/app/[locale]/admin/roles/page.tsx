'use client';

import { Avatar, Button, Card, Space, Table, Tag } from 'antd';
import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const roles = [
  {
    key: '1',
    name: 'Super Admin',
    description: 'Full access to all system features',
    usersCount: 2,
    permissions: 20,
    createdAt: '2024-01-01',
  },
  {
    key: '2',
    name: 'Admin',
    description: 'Administrative access with limited system settings',
    usersCount: 5,
    permissions: 15,
    createdAt: '2024-01-01',
  },
  {
    key: '3',
    name: 'Editor',
    description: 'Can create and edit content',
    usersCount: 12,
    permissions: 8,
    createdAt: '2024-01-15',
  },
  {
    key: '4',
    name: 'User',
    description: 'Basic access to the system',
    usersCount: 156,
    permissions: 3,
    createdAt: '2024-01-01',
  },
];

const columns = [
  {
    title: 'Role Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => (
      <Space>
        <Avatar
          size="small"
          icon={<SafetyCertificateOutlined />}
          style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
        />
        <span style={{ fontWeight: 500 }}>{name}</span>
      </Space>
    ),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (text: string) => (
      <span style={{ color: 'var(--ant-color-text-secondary)' }}>{text}</span>
    ),
  },
  {
    title: 'Users',
    dataIndex: 'usersCount',
    key: 'usersCount',
    align: 'center' as const,
    render: (count: number) => <Tag>{count}</Tag>,
  },
  {
    title: 'Permissions',
    dataIndex: 'permissions',
    key: 'permissions',
    align: 'center' as const,
    render: (count: number) => <Tag color="blue">{count}</Tag>,
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text: string) => (
      <span style={{ color: 'var(--ant-color-text-secondary)' }}>{text}</span>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'right' as const,
    render: () => <Button size="small">Edit</Button>,
  },
];

export default function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles"
        description="Manage user roles and their permissions"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'User Management', href: '/admin/users' },
          { label: 'Roles' },
        ]}
        actions={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Role
          </Button>
        }
      />
      <PageContent>
        <PageSection>
          <Card>
            <Table columns={columns} dataSource={roles} pagination={false} />
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
