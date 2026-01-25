import type { Meta, StoryObj } from '@storybook/react';

// Simple mock component that mimics LanguageSwitcher behavior without router dependencies
function LanguageSwitcherMock() {
  return (
    <select
      defaultValue="en"
      className="rounded-md border-gray-300 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="zh-TW">繁體中文</option>
    </select>
  );
}

const meta: Meta<typeof LanguageSwitcherMock> = {
  title: 'UI/LanguageSwitcher',
  component: LanguageSwitcherMock,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InNavbar: Story = {
  render: () => (
    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Language:
      </span>
      <LanguageSwitcherMock />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label
        htmlFor="lang-select"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Select Language
      </label>
      <select
        id="lang-select"
        defaultValue="zh-TW"
        className="rounded-md border-gray-300 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="zh-TW">繁體中文</option>
      </select>
    </div>
  ),
};

export const AllLocales: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Available language options:
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-20 text-sm font-medium">English:</span>
          <select
            defaultValue="en"
            className="rounded-md border-gray-300 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-sm font-medium">中文:</span>
          <select
            defaultValue="zh-TW"
            className="rounded-md border-gray-300 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </div>
      </div>
    </div>
  ),
};
