'use client';

import { Button, Card, Space, Table, Tag } from 'antd';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const orders = [
  {
    key: '1',
    id: '#1234',
    customer: 'John Doe',
    amount: '$299.00',
    status: 'Pending',
    date: '2024-01-15',
  },
  {
    key: '2',
    id: '#1235',
    customer: 'Jane Smith',
    amount: '$149.00',
    status: 'Processing',
    date: '2024-01-15',
  },
  {
    key: '3',
    id: '#1236',
    customer: 'Bob Wilson',
    amount: '$599.00',
    status: 'Completed',
    date: '2024-01-14',
  },
  {
    key: '4',
    id: '#1237',
    customer: 'Alice Brown',
    amount: '$89.00',
    status: 'Pending',
    date: '2024-01-14',
  },
];

const columns = [
  { title: 'Order ID', dataIndex: 'id', key: 'id' },
  { title: 'Customer', dataIndex: 'customer', key: 'customer' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const color =
        status === 'Pending'
          ? 'warning'
          : status === 'Processing'
            ? 'processing'
            : 'success';
      return <Tag color={color}>{status}</Tag>;
    },
  },
  { title: 'Date', dataIndex: 'date', key: 'date' },
  {
    title: 'Actions',
    key: 'actions',
    render: () => <Button size="small">View</Button>,
  },
];

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="All Orders"
        description="View and manage all orders"
        breadcrumbs={[
          { label: 'Console', href: '/console' },
          { label: 'Order Management', href: '/console/orders' },
          { label: 'All Orders' },
        ]}
        actions={
          <Space>
            <Button>Export</Button>
            <Button type="primary">New Order</Button>
          </Space>
        }
      />
      <PageContent>
        <PageSection>
          <Card>
            <Table columns={columns} dataSource={orders} pagination={false} />
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
