'use client';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Card, CardBody, StatCard } from '@/components/ui';

export default function ConsoleDashboardPage() {
  const stats = [
    {
      label: 'Pending Orders',
      value: '24',
      valueClassName: 'text-3xl font-bold text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Open Tickets',
      value: '8',
      valueClassName: 'text-3xl font-bold text-red-600 dark:text-red-400',
    },
    {
      label: 'Pending Reviews',
      value: '15',
      valueClassName: 'text-3xl font-bold text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Processed Today',
      value: '142',
      valueClassName: 'text-3xl font-bold text-green-600 dark:text-green-400',
    },
  ];

  const recentActivities = [
    { action: 'Order #1234 processed', time: '5 min ago', type: 'order' },
    { action: 'Ticket #567 resolved', time: '12 min ago', type: 'ticket' },
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
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'ticket':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'review':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'refund':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
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
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                title={stat.label}
                value={stat.value}
                valueClassName={stat.valueClassName}
              />
            ))}
          </div>
        </PageSection>

        <PageSection title="Recent Activity">
          <Card>
            <CardBody>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="flex items-center gap-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(activity.type)}`}
                    >
                      {activity.type}
                    </span>
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                      {activity.action}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
