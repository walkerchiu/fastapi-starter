'use client';

import { Avatar, Card, Col, List, Row, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const { Text } = Typography;

export default function ConsoleDashboardPage() {
  const stats = [
    { label: 'Pending Orders', value: '24', color: '#faad14' },
    { label: 'Open Tickets', value: '8', color: '#ff4d4f' },
    { label: 'Pending Reviews', value: '15', color: '#1890ff' },
    { label: 'Processed Today', value: '142', color: '#52c41a' },
  ];

  const recentActivities = [
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
      icon: <RollbackOutlined />,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#faad14';
      case 'ticket':
        return '#1890ff';
      case 'review':
        return '#52c41a';
      case 'refund':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  return (
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
            {stats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.label}>
                <Card size="small">
                  <Text type="secondary">{stat.label}</Text>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 600,
                      marginTop: 4,
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </PageSection>

        <PageSection title="Recent Activity">
          <Card>
            <List
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: getTypeColor(activity.type) }}
                        icon={activity.icon}
                      />
                    }
                    title={activity.action}
                    description={activity.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
