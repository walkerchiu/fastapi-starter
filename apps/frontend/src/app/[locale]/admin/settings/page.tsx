'use client';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button, Card, CardBody, CardHeader } from '@/components/ui';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure system settings"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'System', href: '/admin/settings' },
          { label: 'Settings' },
        ]}
      />
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <PageSection title="General Settings">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Application Settings
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Name
                    </label>
                    <input
                      type="text"
                      defaultValue="My Application"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Support Email
                    </label>
                    <input
                      type="email"
                      defaultValue="support@example.com"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          </PageSection>

          <PageSection title="Security Settings">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Security Options
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Require 2FA for all admin users
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Session Timeout
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Auto logout after inactivity
                      </p>
                    </div>
                    <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>8 hours</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>
          </PageSection>
        </div>
      </PageContent>
    </>
  );
}
