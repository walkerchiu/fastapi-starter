'use client';

import { useSession } from 'next-auth/react';
import { Avatar, Card, Col, Row, Typography } from 'antd';
import {
  UserOutlined,
  SafetyOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  HeartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { useRouter } from '@/i18n/routing';

const { Text } = Typography;

export default function MemberDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

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
      color: '#52c41a',
      bgColor: '#f6ffed',
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords and 2FA',
      href: '/member/security',
      icon: <SafetyOutlined />,
      color: '#faad14',
      bgColor: '#fffbe6',
    },
    {
      title: 'Activity Log',
      description: 'View your recent activities',
      href: '/member/activity',
      icon: <HistoryOutlined />,
      color: '#1890ff',
      bgColor: '#e6f7ff',
    },
    {
      title: 'My Orders',
      description: 'Track and manage your orders',
      href: '/member/orders',
      icon: <ShoppingOutlined />,
      color: '#722ed1',
      bgColor: '#f9f0ff',
    },
    {
      title: 'Favorites',
      description: 'View your saved items',
      href: '/member/favorites',
      icon: <HeartOutlined />,
      color: '#eb2f96',
      bgColor: '#fff0f6',
    },
    {
      title: 'Settings',
      description: 'Customize your preferences',
      href: '/member/settings',
      icon: <SettingOutlined />,
      color: '#13c2c2',
      bgColor: '#e6fffb',
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
              <Col xs={24} sm={12} md={8} key={action.title}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(action.href)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: action.bgColor,
                        color: action.color,
                      }}
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
