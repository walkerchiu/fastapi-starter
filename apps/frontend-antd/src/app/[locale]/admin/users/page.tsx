'use client';

import { Button, Card, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const users = [
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
  {
    key: '4',
    name: 'David Brown',
    email: 'david@example.com',
    role: 'Editor',
    status: 'Active',
  },
];

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'Active' ? 'success' : 'default'}>{status}</Tag>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: () => <Button size="small">Edit</Button>,
  },
];

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
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
            <Table columns={columns} dataSource={users} pagination={false} />
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
