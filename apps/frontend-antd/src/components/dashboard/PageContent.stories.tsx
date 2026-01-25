import type { Meta, StoryObj } from '@storybook/react';
import { PageContent } from './PageContent';
import { PageSection } from './PageSection';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const meta: Meta<typeof PageContent> = {
  title: 'Dashboard/PageContent',
  component: PageContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleSection = ({ title }: { title: string }) => (
  <Card>
    <Title level={5}>{title}</Title>
    <Text type="secondary">
      This is sample content for the section. It demonstrates how content is
      laid out within the PageContent component.
    </Text>
  </Card>
);

export const Default: Story = {
  args: {
    children: (
      <>
        <SampleSection title="Section 1" />
        <SampleSection title="Section 2" />
        <SampleSection title="Section 3" />
      </>
    ),
  },
};

export const WithPageSections: Story = {
  args: {
    children: (
      <>
        <PageSection title="Profile Information">
          <Text type="secondary">
            Your profile information is displayed here.
          </Text>
        </PageSection>
        <PageSection title="Account Settings">
          <Text type="secondary">
            Manage your account settings and preferences.
          </Text>
        </PageSection>
        <PageSection title="Security">
          <Text type="secondary">
            Update your password and security settings.
          </Text>
        </PageSection>
      </>
    ),
  },
};

export const SingleSection: Story = {
  args: {
    children: <SampleSection title="Single Section" />,
  },
};

export const ManyItems: Story = {
  args: {
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SampleSection key={i} title={`Section ${i}`} />
        ))}
      </>
    ),
  },
};
