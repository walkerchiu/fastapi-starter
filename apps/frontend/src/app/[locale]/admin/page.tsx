'use client';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Card, CardBody, StatCard } from '@/components/ui';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Users', value: '1,234' },
    { label: 'Active Sessions', value: '56' },
    { label: 'Total Files', value: '789' },
    { label: 'System Health', value: '99.9%' },
  ];

  const recentActivities = [
    { action: 'User john@example.com created', time: '5 minutes ago' },
    { action: 'Role "Editor" updated', time: '1 hour ago' },
    { action: 'System backup completed', time: '3 hours ago' },
    { action: 'New file uploaded by admin', time: '5 hours ago' },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="System overview and quick stats"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Dashboard' },
        ]}
      />
      <PageContent>
        <PageSection title="Quick Stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                title={stat.label}
                value={stat.value}
              />
            ))}
          </div>
        </PageSection>

        <PageSection title="Recent Activity">
          <Card>
            <CardBody>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {activity.action}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </span>
                    </div>
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
