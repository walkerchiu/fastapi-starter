import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Table,
  Tag,
  Button,
  Space,
} from 'antd';
import {
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ConsoleDashboard } from './ConsoleDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const meta: Meta<typeof ConsoleDashboard> = {
  title: 'Dashboard/Templates/ConsoleDashboard',
  component: ConsoleDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsoleDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Operations Dashboard"
      description="Monitor and manage daily operations"
      breadcrumbs={[
        { label: 'Console', href: '/console' },
        { label: 'Dashboard' },
      ]}
    />
    <PageContent>
      <PageSection title="Today's Overview">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={24}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Open Tickets"
                value={8}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Reviews"
                value={15}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Processed Today"
                value={142}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </PageSection>
      <PageSection title="Recent Activity">
        <Card>
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                action: 'Order #1234 processed',
                time: '5 min ago',
                type: 'order',
                icon: <ShoppingCartOutlined />,
              },
              {
                action: 'Ticket #567 resolved',
                time: '12 min ago',
                type: 'ticket',
                icon: <CustomerServiceOutlined />,
              },
              {
                action: 'Review approved for Product A',
                time: '25 min ago',
                type: 'review',
                icon: <CheckCircleOutlined />,
              },
              {
                action: 'Refund issued for Order #1198',
                time: '1 hour ago',
                type: 'refund',
                icon: <SyncOutlined />,
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={item.icon}
                      style={{
                        backgroundColor:
                          item.type === 'order'
                            ? '#fff7e6'
                            : item.type === 'ticket'
                              ? '#e6f7ff'
                              : item.type === 'review'
                                ? '#f6ffed'
                                : '#fff1f0',
                        color:
                          item.type === 'order'
                            ? '#fa8c16'
                            : item.type === 'ticket'
                              ? '#1890ff'
                              : item.type === 'review'
                                ? '#52c41a'
                                : '#f5222d',
                      }}
                    />
                  }
                  title={item.action}
                  description={item.time}
                />
              </List.Item>
            )}
          />
        </Card>
      </PageSection>
    </PageContent>
  </>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'dashboard',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
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
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
      avatar: 'https://i.pravatar.cc/150?u=operator',
    },
    activeMenuKey: 'dashboard',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'dashboard',
  },
};

export const OrdersPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Pending Orders"
          description="Orders awaiting processing"
          breadcrumbs={[
            { label: 'Console', href: '/console' },
            { label: 'Orders', href: '/console/orders' },
            { label: 'Pending' },
          ]}
          actions={
            <Button
              type="primary"
              style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
            >
              Process All
            </Button>
          }
        />
        <PageContent>
          <PageSection>
            <Card>
              <Table
                dataSource={[
                  {
                    key: '1',
                    id: '#1234',
                    customer: 'John Doe',
                    amount: '$299.00',
                    status: 'Pending',
                  },
                  {
                    key: '2',
                    id: '#1235',
                    customer: 'Jane Smith',
                    amount: '$149.00',
                    status: 'Processing',
                  },
                  {
                    key: '3',
                    id: '#1236',
                    customer: 'Bob Wilson',
                    amount: '$599.00',
                    status: 'Pending',
                  },
                ]}
                columns={[
                  { title: 'Order ID', dataIndex: 'id', key: 'id' },
                  { title: 'Customer', dataIndex: 'customer', key: 'customer' },
                  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'Pending' ? 'orange' : 'blue'}>
                        {status}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: () => (
                      <Button type="link" style={{ color: '#fa8c16' }}>
                        Process
                      </Button>
                    ),
                  },
                ]}
                pagination={false}
              />
            </Card>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'pending',
  },
};

export const TicketsPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Support Tickets"
          description="Customer support requests"
          breadcrumbs={[
            { label: 'Console', href: '/console' },
            { label: 'Support', href: '/console/support' },
            { label: 'Tickets' },
          ]}
        />
        <PageContent>
          <PageSection>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {[
                {
                  id: '#567',
                  subject: 'Order not received',
                  priority: 'High',
                  time: '2 hours ago',
                },
                {
                  id: '#568',
                  subject: 'Wrong item shipped',
                  priority: 'Medium',
                  time: '4 hours ago',
                },
                {
                  id: '#569',
                  subject: 'Refund request',
                  priority: 'Low',
                  time: '1 day ago',
                },
              ].map((ticket) => (
                <Card key={ticket.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                    >
                      <Avatar
                        icon={<CustomerServiceOutlined />}
                        style={{
                          backgroundColor:
                            ticket.priority === 'High'
                              ? '#fff1f0'
                              : ticket.priority === 'Medium'
                                ? '#fff7e6'
                                : '#f5f5f5',
                          color:
                            ticket.priority === 'High'
                              ? '#f5222d'
                              : ticket.priority === 'Medium'
                                ? '#fa8c16'
                                : '#8c8c8c',
                        }}
                        size={40}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {ticket.id} - {ticket.subject}
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {ticket.time}
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Tag
                        color={
                          ticket.priority === 'High'
                            ? 'red'
                            : ticket.priority === 'Medium'
                              ? 'orange'
                              : 'default'
                        }
                      >
                        {ticket.priority}
                      </Tag>
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          backgroundColor: '#fa8c16',
                          borderColor: '#fa8c16',
                        }}
                      >
                        View
                      </Button>
                    </Space>
                  </div>
                </Card>
              ))}
            </Space>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'tickets',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    showFooter: false,
    activeMenuKey: 'dashboard',
  },
};
