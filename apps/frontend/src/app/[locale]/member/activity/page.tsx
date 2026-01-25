'use client';

import {
  PageHeader,
  PageContent,
  PageSection,
  Timeline,
} from '@/components/dashboard';
import { Card, CardBody, Badge } from '@/components/ui';

const activities = [
  {
    id: '1',
    title: 'Password Changed',
    description: 'You changed your account password',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
        />
      </svg>
    ),
  },
  {
    id: '2',
    title: 'Profile Updated',
    description: 'You updated your profile information',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: (
      <svg
        className="h-4 w-4"
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
    id: '3',
    title: 'New Login Detected',
    description: 'New login from Chrome on macOS',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'warning' as const,
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: '4',
    title: '2FA Enabled',
    description: 'Two-factor authentication was enabled for your account',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: (
      <svg
        className="h-4 w-4"
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
    id: '5',
    title: 'Account Created',
    description: 'Your account was created successfully',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    ),
  },
];

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity Log"
        description="View your recent account activity"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Activity', href: '/member/activity' },
          { label: 'Activity Log' },
        ]}
      />
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PageSection title="Recent Activity">
              <Card>
                <CardBody>
                  <Timeline items={activities} />
                </CardBody>
              </Card>
            </PageSection>
          </div>

          <div>
            <PageSection title="Activity Summary">
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Activities
                      </span>
                      <Badge variant="neutral">{activities.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Security Events
                      </span>
                      <Badge variant="warning">
                        {
                          activities.filter((a) => a.status === 'warning')
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Last 7 Days
                      </span>
                      <Badge variant="info">
                        {
                          activities.filter(
                            (a) =>
                              a.timestamp.getTime() >
                              Date.now() - 7 * 24 * 60 * 60 * 1000,
                          ).length
                        }
                      </Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </PageSection>

            <PageSection title="Export" className="mt-6">
              <Card>
                <CardBody>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Download your activity history for your records.
                  </p>
                  <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                    Export to CSV
                  </button>
                </CardBody>
              </Card>
            </PageSection>
          </div>
        </div>
      </PageContent>
    </>
  );
}
