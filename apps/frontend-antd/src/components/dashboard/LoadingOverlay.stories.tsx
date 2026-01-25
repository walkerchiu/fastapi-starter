import type { Meta, StoryObj } from '@storybook/react';
import { LoadingOverlay } from './LoadingOverlay';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const meta: Meta<typeof LoadingOverlay> = {
  title: 'Dashboard/Feedback/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

const SampleContent = () => (
  <Card style={{ width: 320 }}>
    <Title level={5}>Sample Card</Title>
    <Paragraph type="secondary">
      This is some content that will be covered by the loading overlay.
    </Paragraph>
    <Paragraph type="secondary">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </Paragraph>
  </Card>
);

export const Default: Story = {
  args: {
    loading: true,
    children: <SampleContent />,
  },
};

export const WithText: Story = {
  args: {
    loading: true,
    text: 'Loading data...',
    children: <SampleContent />,
  },
};

export const NoBlur: Story = {
  args: {
    loading: true,
    blur: false,
    children: <SampleContent />,
  },
};

export const NotLoading: Story = {
  args: {
    loading: false,
    children: <SampleContent />,
  },
};

export const LargeContent: Story = {
  args: {
    loading: true,
    text: 'Processing...',
    children: (
      <div
        style={{
          width: 384,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Card>
          <Title level={5} style={{ margin: 0 }}>
            Section 1
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Content for section one.
          </Paragraph>
        </Card>
        <Card>
          <Title level={5} style={{ margin: 0 }}>
            Section 2
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Content for section two.
          </Paragraph>
        </Card>
        <Card>
          <Title level={5} style={{ margin: 0 }}>
            Section 3
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Content for section three.
          </Paragraph>
        </Card>
      </div>
    ),
  },
};
