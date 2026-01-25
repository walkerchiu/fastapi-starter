import type { Meta, StoryObj } from '@storybook/react';
import { DashboardSidebar } from './DashboardSidebar';

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

const sampleItems = [
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
      {
        key: 'users-permissions',
        label: 'Permissions',
        href: '/users/permissions',
      },
    ],
  },
  {
    key: 'files',
    label: 'Files',
    icon: <FolderIcon />,
    href: '/files',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <BellIcon />,
    href: '/notifications',
    badge: 5,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings',
    disabled: true,
  },
];

const groupedItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/dashboard',
  },
  {
    key: 'management-group',
    label: 'Management',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: <UsersIcon />,
        href: '/users',
      },
      {
        key: 'files',
        label: 'Files',
        icon: <FolderIcon />,
        href: '/files',
      },
    ],
  },
  {
    key: 'system-group',
    label: 'System',
    items: [
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        href: '/settings',
      },
      {
        key: 'notifications',
        label: 'Notifications',
        icon: <BellIcon />,
        href: '/notifications',
        badge: 3,
      },
    ],
  },
];

const meta: Meta<typeof DashboardSidebar> = {
  title: 'Dashboard/DashboardSidebar',
  component: DashboardSidebar,
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
    items: sampleItems,
    activeKey: 'dashboard',
    onCollapse: undefined,
  },
};

export const Collapsed: Story = {
  args: {
    items: sampleItems,
    collapsed: true,
    activeKey: 'dashboard',
  },
};

export const WithGroups: Story = {
  args: {
    items: groupedItems,
    activeKey: 'users',
  },
};

export const NestedMenu: Story = {
  args: {
    items: sampleItems,
    activeKey: 'users-list',
  },
};

export const WithBadges: Story = {
  args: {
    items: sampleItems,
    activeKey: 'notifications',
  },
};

export const WithHeader: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    header: (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-indigo-600" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          Acme Inc
        </span>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    footer: (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="flex-1 truncate">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            John Doe
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            john@example.com
          </p>
        </div>
      </div>
    ),
  },
};

export const WithCollapseControl: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    onCollapse: () => {},
    header: (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-indigo-600" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          Acme Inc
        </span>
      </div>
    ),
  },
};
