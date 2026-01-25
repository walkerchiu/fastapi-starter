import type { Meta, StoryObj } from '@storybook/react';
import { CopyButton } from './CopyButton';

const meta: Meta<typeof CopyButton> = {
  title: 'UI/CopyButton',
  component: CopyButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'outline'],
    },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'Hello, World!',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CopyButton value="Default variant" variant="default" />
      <CopyButton value="Ghost variant" variant="ghost" />
      <CopyButton value="Outline variant" variant="outline" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CopyButton value="Small" size="sm" />
      <CopyButton value="Medium" size="md" />
      <CopyButton value="Large" size="lg" />
    </div>
  ),
};

export const WithCallback: Story = {
  args: {
    value: 'Copied value!',
    onCopySuccess: (value) => alert(`Copied: ${value}`),
  },
};

export const Disabled: Story = {
  args: {
    value: 'Cannot copy this',
    disabled: true,
  },
};

export const InContext: Story = {
  render: () => (
    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
      <code className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        npm install @mypackage/core
      </code>
      <CopyButton value="npm install @mypackage/core" size="sm" />
    </div>
  ),
};

export const GhostVariant: Story = {
  args: {
    value: 'Ghost text',
    variant: 'ghost',
  },
};

export const OutlineVariant: Story = {
  args: {
    value: 'Outline text',
    variant: 'outline',
  },
};

export const DefaultVariant: Story = {
  args: {
    value: 'Default text',
    variant: 'default',
  },
};
