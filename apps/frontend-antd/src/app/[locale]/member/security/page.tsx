'use client';

import { Avatar, Button, Card, Divider, Tag, Typography } from 'antd';
import {
  SafetyOutlined,
  DesktopOutlined,
  MobileOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const { Text } = Typography;

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        title="Security"
        description="Manage your account security settings"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Account', href: '/member/security' },
          { label: 'Security' },
        ]}
      />
      <PageContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <PageSection title="Password">
            <Card>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <Text strong>Password</Text>
                  <br />
                  <Text type="secondary">Last changed 30 days ago</Text>
                </div>
                <Button>Change Password</Button>
              </div>
            </Card>
          </PageSection>

          <PageSection title="Two-Factor Authentication">
            <Card>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar
                    style={{ backgroundColor: '#f6ffed', color: '#52c41a' }}
                    icon={<SafetyOutlined />}
                  />
                  <div>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Text strong>Two-Factor Authentication</Text>
                      <Tag color="success">Enabled</Tag>
                    </div>
                    <Text type="secondary">
                      Your account is protected with 2FA
                    </Text>
                  </div>
                </div>
                <Button>Manage</Button>
              </div>
            </Card>
          </PageSection>

          <PageSection title="Active Sessions">
            <Card>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
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
                      style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}
                      icon={<DesktopOutlined />}
                    />
                    <div>
                      <Text strong>Chrome on macOS</Text>
                      <br />
                      <Text type="secondary">
                        Current session • San Francisco, CA
                      </Text>
                    </div>
                  </div>
                  <Tag color="success">Active</Tag>
                </div>
                <Divider style={{ margin: 0 }} />
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
                      style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}
                      icon={<MobileOutlined />}
                    />
                    <div>
                      <Text strong>Safari on iPhone</Text>
                      <br />
                      <Text type="secondary">
                        Last active 2 hours ago • San Francisco, CA
                      </Text>
                    </div>
                  </div>
                  <Button danger size="small">
                    Revoke
                  </Button>
                </div>
              </div>
            </Card>
          </PageSection>
        </div>
      </PageContent>
    </>
  );
}
