import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Spinner size="sm" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Small</p>
      </div>
      <div className="text-center">
        <Spinner size="md" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Medium</p>
      </div>
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Large</p>
      </div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Spinner size="sm" />
      <span className="text-gray-600 dark:text-gray-400">Loading...</span>
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button
      disabled
      className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white opacity-70"
    >
      <Spinner size="sm" className="border-white border-t-transparent" />
      Saving...
    </button>
  ),
};

export const FullPageLoader: Story = {
  render: () => (
    <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading content...
        </p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-64 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-center justify-center">
        <Spinner size="md" />
      </div>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Fetching data...
      </p>
    </div>
  ),
};
