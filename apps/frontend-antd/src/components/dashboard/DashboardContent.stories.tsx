import type { Meta, StoryObj } from '@storybook/react';
import { DashboardContent } from './DashboardContent';
import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const meta: Meta<typeof DashboardContent> = {
  title: 'Dashboard/DashboardContent',
  component: DashboardContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <Card>
    <Title level={5}>Sample Content</Title>
    <Text type="secondary">
      This is a sample content area. The DashboardContent component provides
      consistent padding and max-width constraints for your page content.
    </Text>
  </Card>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: <SampleContent />,
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: <SampleContent />,
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: <SampleContent />,
  },
};

export const MaxWidthSmall: Story = {
  args: {
    maxWidth: 'sm',
    children: <SampleContent />,
  },
};

export const MaxWidthMedium: Story = {
  args: {
    maxWidth: 'md',
    children: <SampleContent />,
  },
};

export const MaxWidthLarge: Story = {
  args: {
    maxWidth: 'lg',
    children: <SampleContent />,
  },
};

export const AllPaddings: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <div key={padding}>
          <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
            padding=&quot;{padding}&quot;
          </Text>
          <div style={{ background: '#f5f5f5' }}>
            <DashboardContent padding={padding}>
              <SampleContent />
            </DashboardContent>
          </div>
        </div>
      ))}
    </Space>
  ),
};

export const AllMaxWidths: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((maxWidth) => (
        <div key={maxWidth}>
          <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
            maxWidth=&quot;{maxWidth}&quot;
          </Text>
          <div style={{ background: '#f5f5f5' }}>
            <DashboardContent maxWidth={maxWidth}>
              <SampleContent />
            </DashboardContent>
          </div>
        </div>
      ))}
    </Space>
  ),
};
