import type { Meta, StoryObj } from '@storybook/react';
import { ConsoleDashboard } from './ConsoleDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const meta: Meta<typeof ConsoleDashboard> = {
  title: 'Dashboard/Templates/ConsoleDashboard',
  component: ConsoleDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsoleDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Operations Dashboard"
      description="Monitor and manage daily operations"
      breadcrumbs={[
        { label: 'Console', href: '/console' },
        { label: 'Dashboard' },
      ]}
    />
    <PageContent>
      <PageSection title="Today's Overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Pending Orders', value: '24', color: 'amber' },
            { label: 'Open Tickets', value: '8', color: 'red' },
            { label: 'Pending Reviews', value: '15', color: 'blue' },
            { label: 'Processed Today', value: '142', color: 'green' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  stat.color === 'amber'
                    ? 'text-amber-600 dark:text-amber-400'
                    : stat.color === 'red'
                      ? 'text-red-600 dark:text-red-400'
                      : stat.color === 'blue'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
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
              {
                action: 'Order #1234 processed',
                time: '5 min ago',
                type: 'order',
              },
              {
                action: 'Ticket #567 resolved',
                time: '12 min ago',
                type: 'ticket',
              },
              {
                action: 'Review approved for Product A',
                time: '25 min ago',
                type: 'review',
              },
              {
                action: 'Refund issued for Order #1198',
                time: '1 hour ago',
                type: 'refund',
              },
            ].map((activity, index) => (
              <li key={index} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        activity.type === 'order'
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400'
                          : activity.type === 'ticket'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                            : activity.type === 'review'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      }`}
                    >
                      {activity.type === 'order' && (
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
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      )}
                      {activity.type === 'ticket' && (
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
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      )}
                      {activity.type === 'review' && (
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      {activity.type === 'refund' && (
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                  </div>
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
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'dashboard',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
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
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
      avatar: 'https://i.pravatar.cc/150?u=operator',
    },
    activeMenuKey: 'dashboard',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'dashboard',
  },
};

export const OrdersPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Pending Orders"
          description="Orders awaiting processing"
          breadcrumbs={[
            { label: 'Console', href: '/console' },
            { label: 'Orders', href: '/console/orders' },
            { label: 'Pending' },
          ]}
          actions={
            <button className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
              Process All
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
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    {
                      id: '#1234',
                      customer: 'John Doe',
                      amount: '$299.00',
                      status: 'Pending',
                    },
                    {
                      id: '#1235',
                      customer: 'Jane Smith',
                      amount: '$149.00',
                      status: 'Processing',
                    },
                    {
                      id: '#1236',
                      customer: 'Bob Wilson',
                      amount: '$599.00',
                      status: 'Pending',
                    },
                  ].map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {order.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {order.customer}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {order.amount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            order.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">
                          Process
                        </button>
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
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'pending',
  },
};

export const TicketsPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Support Tickets"
          description="Customer support requests"
          breadcrumbs={[
            { label: 'Console', href: '/console' },
            { label: 'Support', href: '/console/support' },
            { label: 'Tickets' },
          ]}
        />
        <PageContent>
          <PageSection>
            <div className="space-y-4">
              {[
                {
                  id: '#567',
                  subject: 'Order not received',
                  priority: 'High',
                  time: '2 hours ago',
                },
                {
                  id: '#568',
                  subject: 'Wrong item shipped',
                  priority: 'Medium',
                  time: '4 hours ago',
                },
                {
                  id: '#569',
                  subject: 'Refund request',
                  priority: 'Low',
                  time: '1 day ago',
                },
              ].map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        ticket.priority === 'High'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                          : ticket.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
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
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {ticket.id} - {ticket.subject}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ticket.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        ticket.priority === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : ticket.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <button className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'tickets',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    showFooter: false,
    activeMenuKey: 'dashboard',
  },
};
