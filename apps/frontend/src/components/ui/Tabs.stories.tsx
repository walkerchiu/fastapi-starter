import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Account
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Make changes to your account here. Click save when you&apos;re done.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Password
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Change your password here. After saving, you&apos;ll be logged out.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adjust your settings and preferences here.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[300px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="p-4 text-gray-700 dark:text-gray-300">
          Content for Tab 1
        </p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="p-4 text-gray-700 dark:text-gray-300">
          Content for Tab 2
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="enabled1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="enabled1">Enabled</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="enabled2">Also Enabled</TabsTrigger>
      </TabsList>
      <TabsContent value="enabled1">
        <p className="p-4 text-gray-700 dark:text-gray-300">
          This tab is enabled and can be selected.
        </p>
      </TabsContent>
      <TabsContent value="disabled">
        <p className="p-4 text-gray-700 dark:text-gray-300">
          You should not be able to see this content.
        </p>
      </TabsContent>
      <TabsContent value="enabled2">
        <p className="p-4 text-gray-700 dark:text-gray-300">
          This tab is also enabled.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

function ControlledExample() {
  const [value, setValue] = useState('first');

  return (
    <div className="w-[400px] space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setValue('first')}
          className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-500"
        >
          Go to First
        </button>
        <button
          onClick={() => setValue('second')}
          className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-500"
        >
          Go to Second
        </button>
        <button
          onClick={() => setValue('third')}
          className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-500"
        >
          Go to Third
        </button>
      </div>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="second">Second</TabsTrigger>
          <TabsTrigger value="third">Third</TabsTrigger>
        </TabsList>
        <TabsContent value="first">
          <p className="p-4 text-gray-700 dark:text-gray-300">
            First tab content
          </p>
        </TabsContent>
        <TabsContent value="second">
          <p className="p-4 text-gray-700 dark:text-gray-300">
            Second tab content
          </p>
        </TabsContent>
        <TabsContent value="third">
          <p className="p-4 text-gray-700 dark:text-gray-300">
            Third tab content
          </p>
        </TabsContent>
      </Tabs>
      <p className="text-sm text-gray-500">Current value: {value}</p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="profile" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="profile" className="gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Notifications
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Security
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300">
            Profile settings content
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300">
            Notification preferences content
          </p>
        </div>
      </TabsContent>
      <TabsContent value="security">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300">
            Security settings content
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
