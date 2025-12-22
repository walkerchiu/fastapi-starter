import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '@/components/providers/theme-provider';

// Mock ThemeProvider wrapper for Storybook
function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex items-center gap-4">{children}</div>
    </ThemeProvider>
  );
}

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProviderWrapper>
        <Story />
      </ThemeProviderWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-gray-100 dark:bg-gray-700',
  },
};

export const InNavbar: Story = {
  render: () => (
    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Settings
      </span>
      <ThemeToggle />
    </div>
  ),
};

export const AllThemeStates: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click the button to cycle through themes: Light → Dark → System
      </p>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-gray-500">
          The icon changes based on the current theme selection
        </span>
      </div>
    </div>
  ),
};
