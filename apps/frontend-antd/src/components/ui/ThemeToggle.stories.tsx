import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  args: {},
};

export const InNavbar: Story = {
  render: () => (
    <div className="flex items-center gap-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <span className="text-gray-700 dark:text-gray-300">Theme:</span>
      <ThemeToggle />
    </div>
  ),
};
