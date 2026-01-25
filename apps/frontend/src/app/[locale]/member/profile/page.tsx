'use client';

import { useSession } from 'next-auth/react';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button, Card, CardBody } from '@/components/ui';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PageSection title="Personal Information">
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={session?.user?.name || ''}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={session?.user?.email || ''}
                          disabled
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </PageSection>
          </div>

          <div>
            <PageSection title="Profile Photo">
              <Card>
                <CardBody className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-12 w-12"
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
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                </CardBody>
              </Card>
            </PageSection>
          </div>
        </div>
      </PageContent>
    </>
  );
}
