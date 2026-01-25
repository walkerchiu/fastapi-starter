import type { Meta, StoryObj } from '@storybook/react';
import { MemberDashboard } from './MemberDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const meta: Meta<typeof MemberDashboard> = {
  title: 'Dashboard/Templates/MemberDashboard',
  component: MemberDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MemberDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Welcome Back!"
      description="Here's what's happening with your account"
      breadcrumbs={[
        { label: 'Member', href: '/member' },
        { label: 'Overview' },
      ]}
    />
    <PageContent>
      <PageSection title="Account Summary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Account Status', value: 'Active', color: 'emerald' },
            { label: 'Member Since', value: 'Jan 2024', color: 'blue' },
            { label: 'Last Login', value: '2 hours ago', color: 'gray' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p
                className={`mt-1 text-lg font-semibold ${
                  stat.color === 'emerald'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : stat.color === 'blue'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </PageSection>
      <PageSection title="Recent Activity">
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              { action: 'Logged in', time: '2 hours ago' },
              { action: 'Updated profile', time: '1 day ago' },
              { action: 'Changed password', time: '3 days ago' },
            ].map((activity, index) => (
              <li key={index} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>
    </PageContent>
  </>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'overview',
  },
};

export const WithAvatar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
      avatar: 'https://i.pravatar.cc/150?u=member',
    },
    activeMenuKey: 'overview',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'overview',
  },
};

export const WithExtendedMenu: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    menuExtend: [
      {
        key: 'rewards-group',
        label: 'Rewards',
        items: [
          {
            key: 'points',
            label: 'My Points',
            href: '/member/points',
            badge: 1250,
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            key: 'rewards',
            label: 'Redeem Rewards',
            href: '/member/rewards',
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
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            ),
          },
        ],
      },
    ],
    activeMenuKey: 'overview',
  },
};

export const ProfilePage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Profile"
          description="Manage your personal information"
          breadcrumbs={[
            { label: 'Member', href: '/member' },
            { label: 'Account', href: '/member/profile' },
            { label: 'Profile' },
          ]}
        />
        <PageContent>
          <PageSection>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  JU
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Jane User
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    jane@example.com
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Jane"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue="User"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="jane@example.com"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Save Changes
                </button>
              </div>
            </div>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'profile',
  },
};

export const SecurityPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Security"
          description="Manage your security settings"
          breadcrumbs={[
            { label: 'Member', href: '/member' },
            { label: 'Account', href: '/member/security' },
            { label: 'Security' },
          ]}
        />
        <PageContent>
          <PageSection title="Password">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last changed 30 days ago
              </p>
              <button className="mt-4 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Change Password
              </button>
            </div>
          </PageSection>
          <PageSection title="Two-Factor Authentication">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Authenticator App
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use an authenticator app to generate codes
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                  Enabled
                </span>
              </div>
            </div>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'security',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    activeMenuKey: 'overview',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    showFooter: false,
    activeMenuKey: 'overview',
  },
};
