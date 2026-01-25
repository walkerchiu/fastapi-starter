'use client';

import { Card, Row, Col, Typography, Avatar } from 'antd';
import {
  SettingOutlined,
  BellOutlined,
  LockOutlined,
  GlobalOutlined,
  UserOutlined,
  CreditCardOutlined,
  MailOutlined,
  MobileOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { useRouter } from '@/i18n/routing';

const { Text, Title } = Typography;

interface SettingCategory {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const settingCategories: SettingCategory[] = [
  {
    key: 'preferences',
    title: 'Preferences',
    description: 'Language, timezone, currency, and theme settings',
    icon: <GlobalOutlined />,
    href: '/member/settings/preferences',
    color: '#1890ff',
  },
  {
    key: 'profile',
    title: 'Profile',
    description: 'Update your personal information and avatar',
    icon: <UserOutlined />,
    href: '/member/profile',
    color: '#52c41a',
  },
  {
    key: 'security',
    title: 'Security',
    description: 'Password, two-factor authentication, and sessions',
    icon: <LockOutlined />,
    href: '/member/security',
    color: '#faad14',
  },
  {
    key: 'notifications',
    title: 'Notifications',
    description: 'Manage your notification preferences',
    icon: <BellOutlined />,
    href: '/member/notifications',
    color: '#722ed1',
  },
  {
    key: 'payment',
    title: 'Payment Methods',
    description: 'Manage your saved payment methods',
    icon: <CreditCardOutlined />,
    href: '/member/settings/payment',
    color: '#13c2c2',
  },
  {
    key: 'email',
    title: 'Email Settings',
    description: 'Email preferences and subscriptions',
    icon: <MailOutlined />,
    href: '/member/settings/email',
    color: '#eb2f96',
  },
  {
    key: 'mobile',
    title: 'Mobile Settings',
    description: 'Phone number and SMS preferences',
    icon: <MobileOutlined />,
    href: '/member/settings/mobile',
    color: '#fa541c',
  },
  {
    key: 'advanced',
    title: 'Advanced',
    description: 'Data export, account deletion, and more',
    icon: <SettingOutlined />,
    href: '/member/settings/advanced',
    color: '#8c8c8c',
  },
];

export default function SettingsPage() {
  const router = useRouter();

  const handleCategoryClick = (category: SettingCategory) => {
    router.push(category.href);
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings' },
        ]}
      />
      <PageContent>
        <PageSection title="All Settings">
          <Row gutter={[16, 16]}>
            {settingCategories.map((category) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={category.key}>
                <Card
                  hoverable
                  onClick={() => handleCategoryClick(category)}
                  style={{ height: '100%', cursor: 'pointer' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '16px 0',
                    }}
                  >
                    <Avatar
                      size={56}
                      style={{
                        backgroundColor: category.color,
                        marginBottom: 16,
                      }}
                      icon={category.icon}
                    />
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {category.title}
                    </Title>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {category.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </PageSection>

        <PageSection title="Quick Actions">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Avatar
                    size={40}
                    style={{ backgroundColor: '#f0f0f0', color: '#1890ff' }}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <Text strong>Complete Your Profile</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Add more details to your profile
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Avatar
                    size={40}
                    style={{ backgroundColor: '#f0f0f0', color: '#faad14' }}
                    icon={<LockOutlined />}
                  />
                  <div>
                    <Text strong>Enable 2FA</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Add an extra layer of security
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Avatar
                    size={40}
                    style={{ backgroundColor: '#f0f0f0', color: '#722ed1' }}
                    icon={<BellOutlined />}
                  />
                  <div>
                    <Text strong>Review Notifications</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Customize your alerts
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </PageSection>
      </PageContent>
    </>
  );
}
