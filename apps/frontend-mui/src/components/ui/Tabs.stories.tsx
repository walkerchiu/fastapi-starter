import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings and preferences.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-gray-600 dark:text-gray-300">
          Change your password and security settings.
        </p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-gray-600 dark:text-gray-300">
          Configure your notification preferences.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Active Tab</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled Tab
        </TabsTrigger>
        <TabsTrigger value="tab3">Another Tab</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-gray-600 dark:text-gray-300">
          This is the first tab content.
        </p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-gray-600 dark:text-gray-300">
          This tab is disabled and cannot be accessed.
        </p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-gray-600 dark:text-gray-300">
          This is the third tab content.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithRichContent: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                1,234
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Sessions
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                567
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                $12,345
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-gray-600 dark:text-gray-300">
          Analytics content would go here.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-gray-600 dark:text-gray-300">
          Reports content would go here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
