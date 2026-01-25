import type { Meta, StoryObj } from '@storybook/react';
import { PageSection } from './PageSection';
import { Button } from '../ui/Button';

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
  <div className="space-y-4">
    <p className="text-gray-600 dark:text-gray-400">
      This is the main content of the section. It can contain any type of
      content including text, forms, tables, or other components.
    </p>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded border border-gray-200 p-4 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100">Item 1</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Description for item 1
        </p>
      </div>
      <div className="rounded border border-gray-200 p-4 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100">Item 2</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Description for item 2
        </p>
      </div>
    </div>
  </div>
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
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800"
          >
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Activity {i}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {i} hours ago
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
};
