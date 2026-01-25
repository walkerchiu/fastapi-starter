'use client';

import { Card, Col, List, Row, Typography } from 'antd';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const { Text } = Typography;

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Users', value: '1,234' },
    { label: 'Active Sessions', value: '56' },
    { label: 'Total Files', value: '789' },
    { label: 'System Health', value: '99.9%' },
  ];

  const recentActivities = [
    { action: 'User john@example.com created', time: '5 minutes ago' },
    { action: 'Role "Editor" updated', time: '1 hour ago' },
    { action: 'System backup completed', time: '3 hours ago' },
    { action: 'New file uploaded by admin', time: '5 hours ago' },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="System overview and quick stats"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Dashboard' },
        ]}
      />
      <PageContent>
        <PageSection title="Quick Stats">
          <Row gutter={[16, 16]}>
            {stats.map((stat) => (
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

        <PageSection title="Recent Activity">
          <Card>
            <List
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
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
