'use client';

import { useSession } from 'next-auth/react';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Card, CardBody, StatCard } from '@/components/ui';

export default function MemberDashboardPage() {
  const { data: session } = useSession();

  const accountInfo = [
    {
      label: 'Account Status',
      value: 'Active',
      valueClassName: 'text-3xl font-bold text-green-600 dark:text-green-400',
    },
    {
      label: 'Member Since',
      value: 'Jan 2024',
      valueClassName:
        'text-3xl font-bold text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Last Login',
      value: '2 hours ago',
      valueClassName:
        'text-3xl font-bold text-emerald-600 dark:text-emerald-400',
    },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      href: '/member/profile',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords and 2FA',
      href: '/member/security',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      title: 'Activity Log',
      description: 'View your recent activities',
      href: '/member/activity',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${session?.user?.name || 'Member'}`}
        description="Manage your account and preferences"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Overview' },
        ]}
      />
      <PageContent>
        <PageSection title="Account Overview">
          <div className="grid gap-4 sm:grid-cols-3">
            {accountInfo.map((info) => (
              <StatCard
                key={info.label}
                title={info.label}
                value={info.value}
                valueClassName={info.valueClassName}
              />
            ))}
          </div>
        </PageSection>

        <PageSection title="Quick Actions">
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="cursor-pointer transition-shadow hover:shadow-md"
              >
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </PageSection>
      </PageContent>
    </>
  );
}
