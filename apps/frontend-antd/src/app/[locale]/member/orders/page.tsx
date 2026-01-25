'use client';

import { useState, useMemo } from 'react';
import { Table, Tag, Input, Space, Typography, Card, Row, Col } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/routing';

const { Text } = Typography;

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'delivered',
    total: 299.99,
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'shipped',
    total: 149.5,
    items: 2,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'processing',
    total: 89.99,
    items: 1,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'pending',
    total: 459.0,
    items: 5,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'cancelled',
    total: 199.99,
    items: 2,
  },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors: Record<Order['status'], string> = {
  pending: 'orange',
  processing: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch = order.orderNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const orderSummary = useMemo(() => {
    return {
      total: mockOrders.length,
      pending: mockOrders.filter((o) => o.status === 'pending').length,
      processing: mockOrders.filter((o) => o.status === 'processing').length,
      delivered: mockOrders.filter((o) => o.status === 'delivered').length,
    };
  }, []);

  const columns: ColumnsType<Order> = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (orderNumber: string) => (
        <Text strong style={{ color: '#1890ff' }}>
          {orderNumber}
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => date.toLocaleDateString(),
      sorter: (a, b) => a.date.getTime() - b.date.getTime(),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      align: 'center',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toFixed(2)}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Order['status']) => (
        <Tag color={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_: unknown, record: Order) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/member/orders/${record.id}`)}
        >
          <EyeOutlined style={{ marginRight: 4 }} />
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My Orders"
        description="View and track your order history"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Orders' },
        ]}
      />
      <PageContent>
        <PageSection title="Order Summary">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">Total Orders</Text>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}
                >
                  {orderSummary.total}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">Pending</Text>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16' }}
                >
                  {orderSummary.pending}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">Processing</Text>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}
                >
                  {orderSummary.processing}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">Delivered</Text>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}
                >
                  {orderSummary.delivered}
                </div>
              </Card>
            </Col>
          </Row>
        </PageSection>

        <PageSection title="Order History">
          <Card>
            <Space
              style={{ marginBottom: 16, width: '100%' }}
              wrap
              size="middle"
            >
              <Input
                placeholder="Search orders..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={(value: string) => setStatusFilter(value || 'all')}
                options={statusOptions}
                style={{ width: 150 }}
              />
            </Space>

            <Table<Order>
              columns={columns}
              dataSource={filteredOrders}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} orders`,
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <ShoppingOutlined
                      style={{ fontSize: 48, color: '#bfbfbf' }}
                    />
                    <div style={{ marginTop: 16, color: '#8c8c8c' }}>
                      No orders found
                    </div>
                  </div>
                ),
              }}
            />
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
