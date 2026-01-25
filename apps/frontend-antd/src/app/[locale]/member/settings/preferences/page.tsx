'use client';

import { useState } from 'react';
import { Card, Form, Typography, Divider, Radio, Flex, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/routing';

const { Text, Title } = Typography;

interface PreferencesForm {
  language: string;
  timezone: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const timezoneOptions = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Taipei', label: 'Taipei' },
  { value: 'Asia/Singapore', label: 'Singapore' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'TWD', label: 'TWD - New Taiwan Dollar' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'KRW', label: 'KRW - South Korean Won' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

export default function PreferencesPage() {
  const router = useRouter();
  const [form] = Form.useForm<PreferencesForm>();
  const [loading, setLoading] = useState(false);

  const initialValues: PreferencesForm = {
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
  };

  const handleSave = async (values: PreferencesForm) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Preferences saved:', values);
      message.success('Preferences saved successfully');
    } catch {
      message.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('Preferences reset to defaults');
  };

  return (
    <>
      <PageHeader
        title="Preferences"
        description="Customize your account settings"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings', href: '/member/settings' },
          { label: 'Preferences' },
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
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSave}
        >
          <Flex gap={24} wrap="wrap">
            <div style={{ flex: '2 1 500px', minWidth: 0 }}>
              <PageSection title="Regional Settings">
                <Card>
                  <Form.Item
                    name="language"
                    label="Language"
                    extra="Choose your preferred language for the interface"
                  >
                    <Select
                      options={languageOptions}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="timezone"
                    label="Timezone"
                    extra="All dates and times will be displayed in this timezone"
                  >
                    <Select
                      options={timezoneOptions}
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(
                        input: string,
                        option: { label?: string; value?: string } | undefined,
                      ) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    name="currency"
                    label="Currency"
                    extra="Prices will be displayed in this currency"
                  >
                    <Select
                      options={currencyOptions}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Card>
              </PageSection>

              <div style={{ marginTop: 24 }}>
                <PageSection title="Appearance">
                  <Card>
                    <Form.Item
                      name="theme"
                      label="Theme"
                      extra="Choose how the interface should look"
                    >
                      <Radio.Group>
                        <Flex gap={16} wrap="wrap">
                          <Radio.Button
                            value="light"
                            style={{
                              height: 'auto',
                              padding: '12px 24px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 32,
                                backgroundColor: '#ffffff',
                                border: '1px solid #d9d9d9',
                                borderRadius: 4,
                                marginBottom: 8,
                              }}
                            />
                            <Text>Light</Text>
                          </Radio.Button>
                          <Radio.Button
                            value="dark"
                            style={{
                              height: 'auto',
                              padding: '12px 24px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 32,
                                backgroundColor: '#141414',
                                border: '1px solid #434343',
                                borderRadius: 4,
                                marginBottom: 8,
                              }}
                            />
                            <Text>Dark</Text>
                          </Radio.Button>
                          <Radio.Button
                            value="system"
                            style={{
                              height: 'auto',
                              padding: '12px 24px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 32,
                                background:
                                  'linear-gradient(90deg, #ffffff 50%, #141414 50%)',
                                border: '1px solid #d9d9d9',
                                borderRadius: 4,
                                marginBottom: 8,
                              }}
                            />
                            <Text>System</Text>
                          </Radio.Button>
                        </Flex>
                      </Radio.Group>
                    </Form.Item>
                  </Card>
                </PageSection>
              </div>

              <div style={{ marginTop: 24 }}>
                <PageSection title="Notification Preferences">
                  <Card>
                    <Flex vertical gap={16}>
                      <Flex justify="space-between" align="center">
                        <div>
                          <Text strong>Email Notifications</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Receive notifications via email
                          </Text>
                        </div>
                        <Form.Item
                          name="emailNotifications"
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Switch />
                        </Form.Item>
                      </Flex>

                      <Divider style={{ margin: 0 }} />

                      <Flex justify="space-between" align="center">
                        <div>
                          <Text strong>Push Notifications</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Receive push notifications in your browser
                          </Text>
                        </div>
                        <Form.Item
                          name="pushNotifications"
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Switch />
                        </Form.Item>
                      </Flex>

                      <Divider style={{ margin: 0 }} />

                      <Flex justify="space-between" align="center">
                        <div>
                          <Text strong>Marketing Emails</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Receive promotional offers and updates
                          </Text>
                        </div>
                        <Form.Item
                          name="marketingEmails"
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Switch />
                        </Form.Item>
                      </Flex>

                      <Divider style={{ margin: 0 }} />

                      <Flex justify="space-between" align="center">
                        <div>
                          <Text strong>Weekly Digest</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Get a weekly summary of your activity
                          </Text>
                        </div>
                        <Form.Item
                          name="weeklyDigest"
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Switch />
                        </Form.Item>
                      </Flex>
                    </Flex>
                  </Card>
                </PageSection>
              </div>
            </div>

            <div style={{ flex: '1 1 280px', minWidth: 280 }}>
              <PageSection title="Actions">
                <Card>
                  <Flex vertical gap={12}>
                    <Button
                      variant="primary"
                      fullWidth
                      loading={loading}
                      onClick={() => form.submit()}
                    >
                      Save Changes
                    </Button>
                    <Button variant="outline" fullWidth onClick={handleReset}>
                      Reset to Defaults
                    </Button>
                  </Flex>
                </Card>
              </PageSection>

              <div style={{ marginTop: 24 }}>
                <PageSection title="Tips">
                  <Card>
                    <Flex vertical gap={12}>
                      <div>
                        <Title level={5} style={{ marginBottom: 4 }}>
                          Language
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Changing your language will update all text in the
                          application.
                        </Text>
                      </div>
                      <Divider style={{ margin: 0 }} />
                      <div>
                        <Title level={5} style={{ marginBottom: 4 }}>
                          Theme
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          System theme will automatically switch between light
                          and dark based on your device settings.
                        </Text>
                      </div>
                      <Divider style={{ margin: 0 }} />
                      <div>
                        <Title level={5} style={{ marginBottom: 4 }}>
                          Notifications
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          You can always change these settings later from your
                          notification center.
                        </Text>
                      </div>
                    </Flex>
                  </Card>
                </PageSection>
              </div>
            </div>
          </Flex>
        </Form>
      </PageContent>
    </>
  );
}
