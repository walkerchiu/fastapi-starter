import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Avatar,
  Tag,
  List,
} from 'antd';
import { DollarOutlined, GiftOutlined } from '@ant-design/icons';
import { MemberDashboard } from './MemberDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const { Text, Title } = Typography;

const meta: Meta<typeof MemberDashboard> = {
  title: 'Dashboard/Templates/MemberDashboard',
  component: MemberDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MemberDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Welcome Back!"
      description="Here's what's happening with your account"
      breadcrumbs={[
        { label: 'Member', href: '/member' },
        { label: 'Overview' },
      ]}
    />
    <PageContent>
      <PageSection title="Account Summary">
        <Row gutter={[16, 16]}>
          {[
            { label: 'Account Status', value: 'Active', color: '#52c41a' },
            { label: 'Member Since', value: 'Jan 2024', color: '#1677ff' },
            { label: 'Last Login', value: '2 hours ago', color: undefined },
          ].map((stat) => (
            <Col xs={24} sm={12} lg={8} key={stat.label}>
              <Card size="small">
                <Text type="secondary">{stat.label}</Text>
                <div
                  style={{
                    fontSize: 18,
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
            dataSource={[
              { action: 'Logged in', time: '2 hours ago' },
              { action: 'Updated profile', time: '1 day ago' },
              { action: 'Changed password', time: '3 days ago' },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.action} description={item.time} />
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
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'overview',
  },
};

export const WithAvatar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
      avatar: 'https://i.pravatar.cc/150?u=member',
    },
    activeMenuKey: 'overview',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'overview',
  },
};

export const WithExtendedMenu: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    menuExtend: [
      {
        key: 'rewards-group',
        label: 'Rewards',
        items: [
          {
            key: 'points',
            label: 'My Points',
            href: '/member/points',
            badge: 1250,
            icon: <DollarOutlined />,
          },
          {
            key: 'rewards',
            label: 'Redeem Rewards',
            href: '/member/rewards',
            icon: <GiftOutlined />,
          },
        ],
      },
    ],
    activeMenuKey: 'overview',
  },
};

export const ProfilePage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Profile"
          description="Manage your personal information"
          breadcrumbs={[
            { label: 'Member', href: '/member' },
            { label: 'Account', href: '/member/profile' },
            { label: 'Profile' },
          ]}
        />
        <PageContent>
          <PageSection>
            <Card>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <Avatar
                  size={80}
                  style={{ backgroundColor: '#52c41a', fontSize: 28 }}
                >
                  JU
                </Avatar>
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    Jane User
                  </Title>
                  <Text type="secondary">jane@example.com</Text>
                </div>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>First Name</Text>
                  </div>
                  <Input defaultValue="Jane" />
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Last Name</Text>
                  </div>
                  <Input defaultValue="User" />
                </Col>
                <Col xs={24}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Email</Text>
                  </div>
                  <Input type="email" defaultValue="jane@example.com" />
                </Col>
              </Row>
              <div style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'profile',
  },
};

export const SecurityPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Security"
          description="Manage your security settings"
          breadcrumbs={[
            { label: 'Member', href: '/member' },
            { label: 'Account', href: '/member/security' },
            { label: 'Security' },
          ]}
        />
        <PageContent>
          <PageSection title="Password">
            <Card>
              <Text type="secondary">Last changed 30 days ago</Text>
              <div style={{ marginTop: 16 }}>
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
                <div>
                  <Text strong>Authenticator App</Text>
                  <br />
                  <Text type="secondary">
                    Use an authenticator app to generate codes
                  </Text>
                </div>
                <Tag color="success">Enabled</Tag>
              </div>
            </Card>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'security',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    activeMenuKey: 'overview',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    showFooter: false,
    activeMenuKey: 'overview',
  },
};
