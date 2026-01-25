'use client';

import { useSession } from 'next-auth/react';
import { Avatar, Button, Card, Col, Form, Input, Row } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
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
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <PageSection title="Personal Information">
              <Card>
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Full Name">
                        <Input defaultValue={session?.user?.name || ''} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Email Address">
                        <Input
                          type="email"
                          defaultValue={session?.user?.email || ''}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Phone Number">
                    <Input placeholder="+1 (555) 000-0000" />
                  </Form.Item>
                  <Form.Item label="Bio">
                    <Input.TextArea
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                      }}
                    >
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </PageSection>
          </Col>

          <Col xs={24} lg={8}>
            <PageSection title="Profile Photo">
              <Card style={{ textAlign: 'center' }}>
                <Avatar
                  size={96}
                  src={
                    (session?.user as { image?: string } | undefined)?.image ||
                    undefined
                  }
                  style={{
                    backgroundColor: '#f6ffed',
                    color: '#52c41a',
                    marginBottom: 16,
                  }}
                  icon={
                    !(session?.user as { image?: string } | undefined)
                      ?.image ? (
                      <UserOutlined style={{ fontSize: 48 }} />
                    ) : undefined
                  }
                />
                <br />
                <Button>Change Photo</Button>
              </Card>
            </PageSection>
          </Col>
        </Row>
      </PageContent>
    </>
  );
}
