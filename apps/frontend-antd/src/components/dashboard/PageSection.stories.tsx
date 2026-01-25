import type { Meta, StoryObj } from '@storybook/react';
import { PageSection } from './PageSection';
import { Button } from '../ui/Button';
import { Avatar, Row, Col, Typography, Space, Divider } from 'antd';

const { Text } = Typography;

const meta: Meta<typeof PageSection> = {
  title: 'Dashboard/PageSection',
  component: PageSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <Text type="secondary">
      This is the main content of the section. It can contain any type of
      content including text, forms, tables, or other components.
    </Text>
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <div
          style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 6 }}
        >
          <Text strong>Item 1</Text>
          <br />
          <Text type="secondary">Description for item 1</Text>
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div
          style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 6 }}
        >
          <Text strong>Item 2</Text>
          <br />
          <Text type="secondary">Description for item 2</Text>
        </div>
      </Col>
    </Row>
  </Space>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Section Title',
    children: <SampleContent />,
  },
};

export const WithTitleAndDescription: Story = {
  args: {
    title: 'Profile Information',
    description: 'Update your personal information and preferences.',
    children: <SampleContent />,
  },
};

export const WithActions: Story = {
  args: {
    title: 'Team Members',
    description: 'Manage your team members and their roles.',
    actions: (
      <>
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button variant="primary" size="sm">
          Add Member
        </Button>
      </>
    ),
    children: <SampleContent />,
  },
};

export const Collapsible: Story = {
  args: {
    title: 'Advanced Settings',
    description: 'Configure advanced options for your account.',
    collapsible: true,
    children: <SampleContent />,
  },
};

export const CollapsibleDefaultClosed: Story = {
  args: {
    title: 'Hidden by Default',
    description: 'This section is collapsed by default.',
    collapsible: true,
    defaultCollapsed: true,
    children: <SampleContent />,
  },
};

export const CollapsibleWithActions: Story = {
  args: {
    title: 'Notifications',
    description: 'Configure how you receive notifications.',
    collapsible: true,
    actions: (
      <Button variant="outline" size="sm">
        Reset to Default
      </Button>
    ),
    children: <SampleContent />,
  },
};

export const NoHeader: Story = {
  args: {
    children: <SampleContent />,
  },
};

export const LongContent: Story = {
  args: {
    title: 'Activity Log',
    description: 'Recent activity in your account.',
    children: (
      <Space
        direction="vertical"
        style={{ width: '100%' }}
        split={<Divider style={{ margin: 0 }} />}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Space key={i}>
            <Avatar size="small">{i}</Avatar>
            <div>
              <Text strong style={{ display: 'block' }}>
                Activity {i}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i} hours ago
              </Text>
            </div>
          </Space>
        ))}
      </Space>
    ),
  },
};
