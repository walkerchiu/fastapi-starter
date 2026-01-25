'use client';

import { useState } from 'react';
import { Card, Form, Typography, List, Flex, Alert, message } from 'antd';
import {
  SafetyOutlined,
  MobileOutlined,
  TabletOutlined,
  DesktopOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from '@/i18n/routing';

const { Text, Title } = Typography;

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const mockSessions: Session[] = [
  {
    id: '1',
    device: 'Desktop',
    browser: 'Chrome on macOS',
    location: 'San Francisco, CA',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Mobile',
    browser: 'Safari on iPhone',
    location: 'San Francisco, CA',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Tablet',
    browser: 'Chrome on iPad',
    location: 'New York, NY',
    lastActive: '1 day ago',
    isCurrent: false,
  },
];

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [form] = Form.useForm<PasswordFormData>();
  const [sessions, setSessions] = useState(mockSessions);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    message.success('Session revoked successfully');
  };

  const handleRevokeAllSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    message.success('All other sessions revoked successfully');
  };

  const handlePasswordChange = async (values: PasswordFormData) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Password changed');
      message.success('Password changed successfully');
      setShowPasswordForm(false);
      form.resetFields();
    } catch {
      message.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    const iconStyle = { fontSize: 20 };
    if (device === 'Mobile') {
      return <MobileOutlined style={iconStyle} />;
    }
    if (device === 'Tablet') {
      return <TabletOutlined style={iconStyle} />;
    }
    return <DesktopOutlined style={iconStyle} />;
  };

  return (
    <>
      <PageHeader
        title="Security Settings"
        description="Manage your account security and authentication"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings', href: '/member/settings' },
          { label: 'Security' },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/member/settings')}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Back to Settings
          </Button>
        }
      />
      <PageContent>
        <Flex vertical gap={24}>
          {/* Password Section */}
          <PageSection title="Password">
            <Card>
              {!showPasswordForm ? (
                <Flex justify="space-between" align="center">
                  <div>
                    <Title level={5} style={{ marginBottom: 4 }}>
                      Password
                    </Title>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Last changed 30 days ago
                    </Text>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Change Password
                  </Button>
                </Flex>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your current password',
                      },
                    ]}
                  >
                    <Input type="password" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    extra="Must be at least 8 characters with a mix of letters and numbers."
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your new password',
                      },
                      {
                        min: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    ]}
                  >
                    <Input type="password" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    rules={[
                      {
                        required: true,
                        message: 'Please confirm your new password',
                      },
                    ]}
                  >
                    <Input type="password" />
                  </Form.Item>

                  <Flex gap={12}>
                    <Button
                      variant="primary"
                      loading={isChangingPassword}
                      onClick={() => form.submit()}
                    >
                      Update Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        form.resetFields();
                      }}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Form>
              )}
            </Card>
          </PageSection>

          {/* Two-Factor Authentication */}
          <PageSection title="Two-Factor Authentication">
            <Card>
              <Flex justify="space-between" align="center">
                <Flex align="center" gap={16}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f0f5ff',
                      borderRadius: 8,
                    }}
                  >
                    <SafetyOutlined
                      style={{ fontSize: 24, color: '#1890ff' }}
                    />
                  </div>
                  <div>
                    <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
                      <Title level={5} style={{ margin: 0 }}>
                        Two-Factor Authentication
                      </Title>
                      <Badge variant={is2FAEnabled ? 'success' : 'warning'}>
                        {is2FAEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Flex>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {is2FAEnabled
                        ? 'Your account is protected with 2FA'
                        : 'Add an extra layer of security to your account'}
                    </Text>
                  </div>
                </Flex>
                <Button
                  variant={is2FAEnabled ? 'outline' : 'primary'}
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                >
                  {is2FAEnabled ? 'Manage' : 'Enable'}
                </Button>
              </Flex>
            </Card>
          </PageSection>

          {/* Active Sessions */}
          <PageSection
            title="Active Sessions"
            actions={
              sessions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                  style={{ color: '#ff4d4f' }}
                >
                  Revoke All Other Sessions
                </Button>
              )
            }
          >
            <Card>
              <List
                itemLayout="horizontal"
                dataSource={sessions}
                renderItem={(session, index) => (
                  <List.Item
                    actions={[
                      session.isCurrent ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          style={{ color: '#ff4d4f' }}
                        >
                          Revoke
                        </Button>
                      ),
                    ]}
                    style={{
                      borderBottom:
                        index !== sessions.length - 1
                          ? '1px solid #f0f0f0'
                          : 'none',
                      paddingBottom: index !== sessions.length - 1 ? 16 : 0,
                      paddingTop: index !== 0 ? 16 : 0,
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: 8,
                          }}
                        >
                          {getDeviceIcon(session.device)}
                        </div>
                      }
                      title={
                        <Text strong style={{ fontSize: 14 }}>
                          {session.browser}
                        </Text>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {session.isCurrent
                            ? 'Current session'
                            : `Last active ${session.lastActive}`}{' '}
                          • {session.location}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </PageSection>

          {/* Danger Zone */}
          <PageSection title="Danger Zone">
            <Card style={{ borderColor: '#ffccc7' }}>
              <Alert
                type="error"
                showIcon
                message="Delete Account"
                description={
                  <Flex vertical gap={16}>
                    <Text>
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </Text>
                    <div>
                      <Button
                        variant="danger"
                        onClick={() =>
                          message.warning('Account deletion not implemented')
                        }
                      >
                        <DeleteOutlined style={{ marginRight: 8 }} />
                        Delete Account
                      </Button>
                    </div>
                  </Flex>
                }
              />
            </Card>
          </PageSection>
        </Flex>
      </PageContent>
    </>
  );
}
