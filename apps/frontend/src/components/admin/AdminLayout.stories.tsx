import type { Meta, StoryObj } from '@storybook/react';
import { AdminLayout } from './AdminLayout';
import { Button } from '../ui/Button';
import { PageHeader } from '../dashboard/PageHeader';
import { StatsGrid } from '../dashboard/StatsGrid';

const meta: Meta<typeof AdminLayout> = {
  title: 'Admin/AdminLayout',
  component: AdminLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdminLayout>;

const sidebarItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
  },
  {
    key: 'users',
    label: 'Users',
    href: '/admin/users',
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/admin/settings',
  },
];

const UsersIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const sampleStats = [
  { title: 'Total Users', value: '2,543', icon: <UsersIcon /> },
  { title: 'Active Sessions', value: '189', icon: <UsersIcon /> },
  { title: 'Storage Used', value: '45.2 GB', icon: <UsersIcon /> },
  { title: 'API Calls', value: '12.3k', icon: <UsersIcon /> },
];

export const Default: Story = {
  args: {
    sidebarItems,
    sidebarActiveKey: 'dashboard',
    showQuickActions: true,
    quickActions: (
      <>
        <Button size="sm" variant="outline">
          New User
        </Button>
        <Button size="sm" variant="outline">
          Export Data
        </Button>
        <Button size="sm" variant="outline">
          View Logs
        </Button>
      </>
    ),
    children: (
      <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          description="Overview of system status and quick actions."
        />
        <StatsGrid stats={sampleStats} />
      </div>
    ),
  },
};

export const WithoutQuickActions: Story = {
  args: {
    sidebarItems,
    sidebarActiveKey: 'users',
    showQuickActions: false,
    children: (
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage users and their permissions."
        />
        <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
          User table content goes here
        </div>
      </div>
    ),
  },
};
