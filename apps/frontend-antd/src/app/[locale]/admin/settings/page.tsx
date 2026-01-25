'use client';

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Typography,
} from 'antd';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const { Text } = Typography;

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure system settings"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'System', href: '/admin/settings' },
          { label: 'Settings' },
        ]}
      />
      <PageContent>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <PageSection title="General Settings">
              <Card title="Application Settings">
                <Form layout="vertical">
                  <Form.Item label="Site Name">
                    <Input defaultValue="My Application" />
                  </Form.Item>
                  <Form.Item label="Support Email">
                    <Input type="email" defaultValue="support@example.com" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary">Save Changes</Button>
                  </Form.Item>
                </Form>
              </Card>
            </PageSection>
          </Col>

          <Col xs={24} lg={12}>
            <PageSection title="Security Settings">
              <Card title="Security Options">
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <Text strong>Two-Factor Authentication</Text>
                      <br />
                      <Text type="secondary">
                        Require 2FA for all admin users
                      </Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <Text strong>Session Timeout</Text>
                      <br />
                      <Text type="secondary">Auto logout after inactivity</Text>
                    </div>
                    <Select defaultValue="30" style={{ width: 120 }}>
                      <Select.Option value="30">30 minutes</Select.Option>
                      <Select.Option value="60">1 hour</Select.Option>
                      <Select.Option value="240">4 hours</Select.Option>
                      <Select.Option value="480">8 hours</Select.Option>
                    </Select>
                  </div>
                </div>
              </Card>
            </PageSection>
          </Col>
        </Row>
      </PageContent>
    </>
  );
}
