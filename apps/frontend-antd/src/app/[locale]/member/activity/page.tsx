'use client';

import { Button, Card, Flex, Tag, Typography } from 'antd';
import {
  KeyOutlined,
  UserOutlined,
  DesktopOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

import {
  PageHeader,
  PageContent,
  PageSection,
  Timeline,
} from '@/components/dashboard';

const { Text } = Typography;

const activities = [
  {
    id: '1',
    title: 'Password Changed',
    description: 'You changed your account password',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <KeyOutlined />,
  },
  {
    id: '2',
    title: 'Profile Updated',
    description: 'You updated your profile information',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <UserOutlined />,
  },
  {
    id: '3',
    title: 'New Login Detected',
    description: 'New login from Chrome on macOS',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'warning' as const,
    icon: <DesktopOutlined />,
  },
  {
    id: '4',
    title: '2FA Enabled',
    description: 'Two-factor authentication was enabled for your account',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <SafetyCertificateOutlined />,
  },
  {
    id: '5',
    title: 'Account Created',
    description: 'Your account was created successfully',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <UserAddOutlined />,
  },
];

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity Log"
        description="View your recent account activity"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Activity', href: '/member/activity' },
          { label: 'Activity Log' },
        ]}
      />
      <PageContent>
        <Flex gap={24} wrap="wrap">
          <div style={{ flex: '2 1 500px', minWidth: 0 }}>
            <PageSection title="Recent Activity">
              <Card>
                <Timeline items={activities} />
              </Card>
            </PageSection>
          </div>

          <div style={{ flex: '1 1 300px', minWidth: 280 }}>
            <PageSection title="Activity Summary">
              <Card>
                <Flex vertical gap={16}>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">Total Activities</Text>
                    <Tag>{activities.length}</Tag>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">Security Events</Text>
                    <Tag color="warning">
                      {activities.filter((a) => a.status === 'warning').length}
                    </Tag>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">Last 7 Days</Text>
                    <Tag color="blue">
                      {
                        activities.filter(
                          (a) =>
                            a.timestamp.getTime() >
                            Date.now() - 7 * 24 * 60 * 60 * 1000,
                        ).length
                      }
                    </Tag>
                  </Flex>
                </Flex>
              </Card>
            </PageSection>

            <div style={{ marginTop: 24 }}>
              <PageSection title="Export">
                <Card>
                  <Text
                    type="secondary"
                    style={{ display: 'block', marginBottom: 16 }}
                  >
                    Download your activity history for your records.
                  </Text>
                  <Button block>Export to CSV</Button>
                </Card>
              </PageSection>
            </div>
          </div>
        </Flex>
      </PageContent>
    </>
  );
}
