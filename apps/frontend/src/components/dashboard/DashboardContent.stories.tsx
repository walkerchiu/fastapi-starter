import type { Meta, StoryObj } from '@storybook/react';
import { DashboardContent } from './DashboardContent';

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
  <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
      Sample Content
    </h2>
    <p className="text-gray-600 dark:text-gray-400">
      This is a sample content area. The DashboardContent component provides
      consistent padding and max-width constraints for your page content.
    </p>
  </div>
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

export const MaxWidthXL: Story = {
  args: {
    maxWidth: 'xl',
    children: <SampleContent />,
  },
};

export const MaxWidth2XL: Story = {
  args: {
    maxWidth: '2xl',
    children: <SampleContent />,
  },
};

export const AllPaddings: Story = {
  render: () => (
    <div className="space-y-8">
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <div key={padding}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            padding=&quot;{padding}&quot;
          </p>
          <div className="bg-gray-100 dark:bg-gray-800">
            <DashboardContent padding={padding}>
              <SampleContent />
            </DashboardContent>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllMaxWidths: Story = {
  render: () => (
    <div className="space-y-8">
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((maxWidth) => (
        <div key={maxWidth}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            maxWidth=&quot;{maxWidth}&quot;
          </p>
          <div className="bg-gray-100 dark:bg-gray-800">
            <DashboardContent maxWidth={maxWidth}>
              <SampleContent />
            </DashboardContent>
          </div>
        </div>
      ))}
    </div>
  ),
};
