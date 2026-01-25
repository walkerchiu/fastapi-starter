import type { Meta, StoryObj } from '@storybook/react';
import { PageContent } from './PageContent';
import { PageSection } from './PageSection';

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
  <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      This is sample content for the section. It demonstrates how content is
      laid out within the PageContent component.
    </p>
  </div>
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
          <p className="text-gray-600 dark:text-gray-400">
            Your profile information is displayed here.
          </p>
        </PageSection>
        <PageSection title="Account Settings">
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences.
          </p>
        </PageSection>
        <PageSection title="Security">
          <p className="text-gray-600 dark:text-gray-400">
            Update your password and security settings.
          </p>
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
