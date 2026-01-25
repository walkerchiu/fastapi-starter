import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboard } from './AdminDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const meta: Meta<typeof AdminDashboard> = {
  title: 'Dashboard/Templates/AdminDashboard',
  component: AdminDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Dashboard Overview"
      description="Welcome to the admin dashboard"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]}
    />
    <PageContent>
      <PageSection title="Quick Stats">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Users', value: '1,234' },
            { label: 'Active Sessions', value: '56' },
            { label: 'Total Files', value: '789' },
            { label: 'System Health', value: '99.9%' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </PageSection>
    </PageContent>
  </>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    activeMenuKey: 'dashboard',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Administrator',
    },
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    activeMenuKey: 'dashboard',
  },
};

export const WithAvatar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'Admin',
      avatar: 'https://i.pravatar.cc/150?u=admin',
    },
    activeMenuKey: 'dashboard',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'dashboard',
  },
};

export const WithExtendedMenu: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    menuExtend: [
      {
        key: 'custom-group',
        label: 'Custom',
        items: [
          {
            key: 'reports',
            label: 'Reports',
            href: '/admin/reports',
            icon: (
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
          },
          {
            key: 'analytics',
            label: 'Analytics',
            href: '/admin/analytics',
            icon: (
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
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            ),
          },
        ],
      },
    ],
    activeMenuKey: 'dashboard',
  },
};

export const WithCustomFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    footerCopyright: '© 2024 My Company. All rights reserved.',
    footerLinks: [
      { label: 'API Docs', href: '/api-docs' },
      { label: 'Status', href: '/status' },
      { label: 'Changelog', href: '/changelog' },
    ],
    activeMenuKey: 'dashboard',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    showFooter: false,
    activeMenuKey: 'dashboard',
  },
};

export const UsersPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Users"
          description="Manage user accounts"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'User Management', href: '/admin/users' },
            { label: 'Users' },
          ]}
          actions={
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Add User
            </button>
          }
        />
        <PageContent>
          <PageSection>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    {
                      name: 'Alice Johnson',
                      email: 'alice@example.com',
                      role: 'Admin',
                      status: 'Active',
                    },
                    {
                      name: 'Bob Smith',
                      email: 'bob@example.com',
                      role: 'User',
                      status: 'Active',
                    },
                    {
                      name: 'Carol Williams',
                      email: 'carol@example.com',
                      role: 'User',
                      status: 'Inactive',
                    },
                  ].map((user) => (
                    <tr key={user.email}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {user.role}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    activeMenuKey: 'users',
  },
};
