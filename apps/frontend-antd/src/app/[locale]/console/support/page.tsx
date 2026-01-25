'use client';

import { Avatar, Button, Card, List, Tag, Typography } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const { Text } = Typography;

const tickets = [
  {
    id: '#567',
    subject: 'Order not received',
    customer: 'John Doe',
    priority: 'High',
    time: '2 hours ago',
  },
  {
    id: '#568',
    subject: 'Wrong item shipped',
    customer: 'Jane Smith',
    priority: 'Medium',
    time: '4 hours ago',
  },
  {
    id: '#569',
    subject: 'Refund request',
    customer: 'Bob Wilson',
    priority: 'Low',
    time: '1 day ago',
  },
];

export default function SupportPage() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#fff2f0';
      case 'Medium':
        return '#fffbe6';
      default:
        return '#f5f5f5';
    }
  };

  return (
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
          <List
            dataSource={tickets}
            renderItem={(ticket) => (
              <Card style={{ marginBottom: 16 }}>
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
                      style={{
                        backgroundColor: getPriorityBgColor(ticket.priority),
                      }}
                      icon={
                        <CustomerServiceOutlined
                          style={{
                            color:
                              ticket.priority === 'High'
                                ? '#ff4d4f'
                                : ticket.priority === 'Medium'
                                  ? '#faad14'
                                  : '#8c8c8c',
                          }}
                        />
                      }
                    />
                    <div>
                      <Text strong>
                        {ticket.id} - {ticket.subject}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {ticket.customer} • {ticket.time}
                      </Text>
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <Tag color={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Tag>
                    <Button type="primary">View</Button>
                  </div>
                </div>
              </Card>
            )}
          />
        </PageSection>
      </PageContent>
    </>
  );
}
