'use client';

import { useState } from 'react';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button, Card, CardBody, Select, Checkbox } from '@/components/ui';

interface NotificationPreferences {
  email: {
    orders: boolean;
    promotions: boolean;
    newsletter: boolean;
    security: boolean;
  };
  push: {
    orders: boolean;
    promotions: boolean;
    reminders: boolean;
  };
}

export default function PreferencesPage() {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('system');
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: {
      orders: true,
      promotions: true,
      newsletter: false,
      security: true,
    },
    push: {
      orders: true,
      promotions: false,
      reminders: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleNotificationChange = (
    category: 'email' | 'push',
    key: string,
    value: boolean,
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  return (
    <>
      <PageHeader
        title="Preferences"
        description="Customize your experience"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings', href: '/member/settings' },
          { label: 'Preferences' },
        ]}
      />
      <PageContent>
        <div className="space-y-6">
          {/* Language & Region */}
          <PageSection title="Language & Region">
            <Card>
              <CardBody>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <Select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full"
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'zh-TW', label: '繁體中文' },
                        { value: 'zh-CN', label: '简体中文' },
                        { value: 'ja', label: '日本語' },
                        { value: 'ko', label: '한국어' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Timezone
                    </label>
                    <Select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full"
                      options={[
                        { value: 'UTC', label: 'UTC' },
                        {
                          value: 'America/New_York',
                          label: 'Eastern Time (ET)',
                        },
                        {
                          value: 'America/Los_Angeles',
                          label: 'Pacific Time (PT)',
                        },
                        { value: 'Europe/London', label: 'London (GMT)' },
                        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                        { value: 'Asia/Taipei', label: 'Taipei (CST)' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Currency
                    </label>
                    <Select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full"
                      options={[
                        { value: 'USD', label: 'USD ($)' },
                        { value: 'EUR', label: 'EUR (€)' },
                        { value: 'GBP', label: 'GBP (£)' },
                        { value: 'JPY', label: 'JPY (¥)' },
                        { value: 'TWD', label: 'TWD (NT$)' },
                      ]}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </PageSection>

          {/* Appearance */}
          <PageSection title="Appearance">
            <Card>
              <CardBody>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { value: 'light', label: 'Light', icon: '☀️' },
                      { value: 'dark', label: 'Dark', icon: '🌙' },
                      { value: 'system', label: 'System', icon: '💻' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                          theme === option.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </PageSection>

          {/* Email Notifications */}
          <PageSection title="Email Notifications">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Order Updates
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive emails about your order status
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.email.orders}
                      onChange={(e) =>
                        handleNotificationChange(
                          'email',
                          'orders',
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Promotions & Offers
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified about sales and special offers
                        </p>
                      </div>
                      <Checkbox
                        checked={notifications.email.promotions}
                        onChange={(e) =>
                          handleNotificationChange(
                            'email',
                            'promotions',
                            e.target.checked,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Newsletter
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Weekly newsletter with curated content
                        </p>
                      </div>
                      <Checkbox
                        checked={notifications.email.newsletter}
                        onChange={(e) =>
                          handleNotificationChange(
                            'email',
                            'newsletter',
                            e.target.checked,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Security Alerts
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Important security notifications
                        </p>
                      </div>
                      <Checkbox
                        checked={notifications.email.security}
                        onChange={(e) =>
                          handleNotificationChange(
                            'email',
                            'security',
                            e.target.checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </PageSection>

          {/* Push Notifications */}
          <PageSection title="Push Notifications">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Order Updates
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Push notifications for order status changes
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.push.orders}
                      onChange={(e) =>
                        handleNotificationChange(
                          'push',
                          'orders',
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Promotions
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Flash sales and limited-time offers
                        </p>
                      </div>
                      <Checkbox
                        checked={notifications.push.promotions}
                        onChange={(e) =>
                          handleNotificationChange(
                            'push',
                            'promotions',
                            e.target.checked,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Reminders
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cart reminders and wishlist notifications
                        </p>
                      </div>
                      <Checkbox
                        checked={notifications.push.reminders}
                        onChange={(e) =>
                          handleNotificationChange(
                            'push',
                            'reminders',
                            e.target.checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </PageSection>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </PageContent>
    </>
  );
}
