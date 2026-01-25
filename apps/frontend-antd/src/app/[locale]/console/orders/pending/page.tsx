'use client';

import { Button, Card, Space, Table, Tag } from 'antd';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const pendingOrders = [
  {
    key: '1',
    id: '#1234',
    customer: 'John Doe',
    amount: '$299.00',
    items: 3,
    created: '2 hours ago',
  },
  {
    key: '2',
    id: '#1237',
    customer: 'Alice Brown',
    amount: '$89.00',
    items: 1,
    created: '4 hours ago',
  },
  {
    key: '3',
    id: '#1238',
    customer: 'Charlie Davis',
    amount: '$450.00',
    items: 5,
    created: '6 hours ago',
  },
];

const columns = [
  { title: 'Order ID', dataIndex: 'id', key: 'id' },
  { title: 'Customer', dataIndex: 'customer', key: 'customer' },
  {
    title: 'Items',
    dataIndex: 'items',
    key: 'items',
    render: (items: number) => <Tag>{items} items</Tag>,
  },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  { title: 'Created', dataIndex: 'created', key: 'created' },
  {
    title: 'Actions',
    key: 'actions',
    render: () => (
      <Space>
        <Button size="small" type="primary">
          Process
        </Button>
        <Button size="small">View</Button>
      </Space>
    ),
  },
];

export default function PendingOrdersPage() {
  return (
    <>
      <PageHeader
        title="Pending Orders"
        description="Orders awaiting processing"
        breadcrumbs={[
          { label: 'Console', href: '/console' },
          { label: 'Orders', href: '/console/orders' },
          { label: 'Pending' },
        ]}
        actions={<Button type="primary">Process All</Button>}
      />
      <PageContent>
        <PageSection>
          <Card>
            <Table
              columns={columns}
              dataSource={pendingOrders}
              pagination={false}
            />
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
