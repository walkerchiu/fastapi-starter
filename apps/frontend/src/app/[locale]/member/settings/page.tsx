'use client';

import Link from 'next/link';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Card, CardBody, Button } from '@/components/ui';

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Update your personal information, avatar, and bio',
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
    id: 'security',
    title: 'Security',
    description:
      'Manage your password, two-factor authentication, and sessions',
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
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize language, theme, and notification settings',
    href: '/member/settings/preferences',
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'View and manage your notifications',
    href: '/member/notifications',
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
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    id: 'addresses',
    title: 'Addresses',
    description: 'Manage your shipping and billing addresses',
    href: '/member/addresses',
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    id: 'payment',
    title: 'Payment Methods',
    description: 'Add and manage your payment methods',
    href: '/member/payment',
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
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings' },
        ]}
      />
      <PageContent>
        <PageSection>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {settingsCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        {category.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {category.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </PageSection>

        {/* Danger Zone */}
        <PageSection title="Danger Zone" className="mt-8">
          <Card className="border-red-200 dark:border-red-800">
            <CardBody>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-base font-medium text-red-600 dark:text-red-400">
                    Delete Account
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete Account
                </Button>
              </div>
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
