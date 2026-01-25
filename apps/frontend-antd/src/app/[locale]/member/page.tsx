'use client';

import { useSession } from 'next-auth/react';
import { Avatar, Card, Col, Row, Typography } from 'antd';
import {
  UserOutlined,
  SafetyOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const { Text } = Typography;

export default function MemberDashboardPage() {
  const { data: session } = useSession();

  const accountInfo = [
    { label: 'Account Status', value: 'Active', color: '#52c41a' },
    { label: 'Member Since', value: 'Jan 2024', color: '#1890ff' },
    { label: 'Last Login', value: '2 hours ago', color: '#1890ff' },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      href: '/member/profile',
      icon: <UserOutlined />,
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords and 2FA',
      href: '/member/security',
      icon: <SafetyOutlined />,
    },
    {
      title: 'Activity Log',
      description: 'View your recent activities',
      href: '/member/activity',
      icon: <HistoryOutlined />,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${session?.user?.name || 'Member'}`}
        description="Manage your account and preferences"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Overview' },
        ]}
      />
      <PageContent>
        <PageSection title="Account Overview">
          <Row gutter={[16, 16]}>
            {accountInfo.map((info) => (
              <Col xs={24} sm={8} key={info.label}>
                <Card size="small">
                  <Text type="secondary">{info.label}</Text>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      marginTop: 4,
                      color: info.color,
                    }}
                  >
                    {info.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </PageSection>

        <PageSection title="Quick Actions">
          <Row gutter={[16, 16]}>
            {quickActions.map((action) => (
              <Col xs={24} sm={8} key={action.title}>
                <Card hoverable style={{ cursor: 'pointer' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    <Avatar
                      size={48}
                      style={{ backgroundColor: '#f6ffed', color: '#52c41a' }}
                      icon={action.icon}
                    />
                    <div>
                      <Text strong>{action.title}</Text>
                      <br />
                      <Text type="secondary">{action.description}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </PageSection>
      </PageContent>
    </>
  );
}
