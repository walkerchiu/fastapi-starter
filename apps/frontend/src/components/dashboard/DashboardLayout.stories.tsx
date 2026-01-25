import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from './DashboardLayout';
import { PageHeader } from './PageHeader';
import { PageSection } from './PageSection';
import { Button } from '../ui/Button';

const HomeIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="h-5 w-5"
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

const SettingsIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const FolderIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const BellIcon = () => (
  <svg
    className="h-5 w-5"
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
);

const sampleSidebarItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/dashboard',
  },
  {
    key: 'users',
    label: 'Users',
    icon: <UsersIcon />,
    children: [
      { key: 'users-list', label: 'User List', href: '/users' },
      { key: 'users-roles', label: 'Roles', href: '/users/roles' },
    ],
  },
  {
    key: 'files',
    label: 'Files',
    icon: <FolderIcon />,
    href: '/files',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings',
  },
];

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="h-8 w-8 rounded-lg bg-indigo-600" />
    <span className="font-semibold text-gray-900 dark:text-gray-100">
      Acme Inc
    </span>
  </div>
);

const UserAvatar = () => (
  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
);

const SamplePageContent = () => (
  <>
    <PageHeader
      title="Dashboard"
      description="Welcome back! Here's what's happening."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
      actions={
        <Button variant="primary" size="sm">
          Create New
        </Button>
      }
    />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Stat {i}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {i * 1234}
          </p>
        </div>
      ))}
    </div>
    <PageSection title="Recent Activity">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-md border border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Activity Item {i}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Description of the activity
              </p>
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  </>
);

const meta: Meta<typeof DashboardLayout> = {
  title: 'Dashboard/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    headerActions: (
      <>
        <button
          type="button"
          className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <BellIcon />
        </button>
        <UserAvatar />
      </>
    ),
    footerCopyright: '© 2025 Acme Inc. All rights reserved.',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
    children: <SamplePageContent />,
  },
};

export const WithoutSidebar: Story = {
  args: {
    showSidebar: false,
    headerLogo: <Logo />,
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const WithoutFooter: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    showFooter: false,
    children: <SamplePageContent />,
  },
};

export const Collapsed: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarCollapsed: true,
    headerLogo: <Logo />,
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const WithSearch: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const MinimalLayout: Story = {
  args: {
    showSidebar: false,
    showHeader: false,
    showFooter: false,
    children: (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Minimal Layout
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No sidebar, header, or footer
          </p>
        </div>
      </div>
    ),
  },
};
