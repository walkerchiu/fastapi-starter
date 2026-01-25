import type { Meta, StoryObj } from '@storybook/react';
import { FormSection } from './FormSection';
import { Form, Row, Col, Space } from 'antd';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';

const meta: Meta<typeof FormSection> = {
  title: 'Dashboard/Form/FormSection',
  component: FormSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof FormSection>;

export const Default: Story = {
  args: {
    title: 'Personal Information',
    description: 'Update your personal details here.',
    children: (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="First Name" required>
              <Input placeholder="John" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Last Name" required>
              <Input placeholder="Doe" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Email" required>
              <Input type="email" placeholder="john@example.com" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    ),
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Account Settings',
    children: (
      <Form layout="vertical">
        <Form.Item label="Username">
          <Input placeholder="johndoe" />
        </Form.Item>
        <Form.Item label="Language">
          <Select
            placeholder="Select language"
            options={[
              { value: 'en', label: 'English' },
              { value: 'zh-TW', label: '繁體中文' },
            ]}
            fullWidth
          />
        </Form.Item>
      </Form>
    ),
  },
};

export const SecuritySettings: Story = {
  args: {
    title: 'Security',
    description: 'Manage your account security settings.',
    children: (
      <Form layout="vertical">
        <Form.Item label="Current Password">
          <Input type="password" />
        </Form.Item>
        <Form.Item label="New Password">
          <Input type="password" />
        </Form.Item>
        <Form.Item label="Confirm Password">
          <Input type="password" />
        </Form.Item>
        <div style={{ paddingTop: 8 }}>
          <Checkbox>Enable two-factor authentication</Checkbox>
        </div>
      </Form>
    ),
  },
};

export const MultipleSections: Story = {
  render: () => (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <FormSection
        title="Profile"
        description="Your public profile information."
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Display Name">
                <Input placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Bio">
                <Input placeholder="A short bio..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </FormSection>

      <FormSection
        title="Notifications"
        description="Configure how you receive notifications."
      >
        <Space direction="vertical" size={12}>
          <Checkbox defaultChecked>Email notifications</Checkbox>
          <Checkbox>Push notifications</Checkbox>
          <Checkbox defaultChecked>Weekly digest</Checkbox>
        </Space>
      </FormSection>
    </Space>
  ),
};
