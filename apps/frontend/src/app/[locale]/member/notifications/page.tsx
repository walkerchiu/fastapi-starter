'use client';

import { useState } from 'react';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Badge, Button, Card, CardBody, Checkbox } from '@/components/ui';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'account';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD-2024-001 has been delivered successfully.',
    date: '2024-01-23T14:30:00Z',
    read: false,
    actionUrl: '/member/orders/1',
    actionLabel: 'View Order',
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Flash Sale!',
    message: 'Get 30% off on all electronics. Limited time offer!',
    date: '2024-01-22T10:00:00Z',
    read: false,
    actionUrl: '/products?category=electronics',
    actionLabel: 'Shop Now',
  },
  {
    id: '3',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD-2024-002 has been shipped. Track your package.',
    date: '2024-01-21T09:00:00Z',
    read: true,
    actionUrl: '/member/orders/2',
    actionLabel: 'Track Order',
  },
  {
    id: '4',
    type: 'account',
    title: 'Password Changed',
    message:
      'Your password was changed successfully. If you did not make this change, please contact support.',
    date: '2024-01-20T15:00:00Z',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    message:
      'Scheduled maintenance will occur on January 25th, 2024 from 2:00 AM to 4:00 AM UTC.',
    date: '2024-01-19T12:00:00Z',
    read: true,
  },
  {
    id: '6',
    type: 'promotion',
    title: 'New Arrivals',
    message: 'Check out our latest collection of spring products!',
    date: '2024-01-18T08:00:00Z',
    read: true,
    actionUrl: '/products?sort=newest',
    actionLabel: 'Explore',
  },
];

const typeConfig = {
  order: {
    label: 'Order',
    variant: 'info' as const,
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  promotion: {
    label: 'Promotion',
    variant: 'success' as const,
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
          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
        />
      </svg>
    ),
  },
  system: {
    label: 'System',
    variant: 'warning' as const,
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
  account: {
    label: 'Account',
    variant: 'neutral' as const,
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
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.read,
  );

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteSelected = () => {
    setNotifications(notifications.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Notifications' },
        ]}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllRead}>
                Mark All Read
              </Button>
            )}
          </div>
        }
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardBody>
              {/* Toolbar */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={
                      selectedIds.length === filteredNotifications.length &&
                      filteredNotifications.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                  {selectedIds.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteSelected}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete Selected ({selectedIds.length})
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    Unread ({unreadCount})
                  </Button>
                </div>
              </div>

              {/* Notification List */}
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-4 px-2 py-4 transition-colors ${
                        !notification.read
                          ? 'bg-primary-50/50 dark:bg-primary-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start pt-1">
                        <Checkbox
                          checked={selectedIds.includes(notification.id)}
                          onChange={() => handleSelect(notification.id)}
                        />
                      </div>

                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          notification.type === 'order'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : notification.type === 'promotion'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : notification.type === 'system'
                                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {typeConfig[notification.type].icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-medium ${
                                  !notification.read
                                    ? 'text-gray-900 dark:text-gray-100'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary-500" />
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {formatDate(notification.date)}
                              </span>
                              <Badge
                                variant={typeConfig[notification.type].variant}
                              >
                                {typeConfig[notification.type].label}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          {notification.actionUrl && (
                            <a href={notification.actionUrl}>
                              <Button size="sm" variant="outline">
                                {notification.actionLabel || 'View'}
                              </Button>
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleRead(notification.id)}
                          >
                            {notification.read
                              ? 'Mark as Unread'
                              : 'Mark as Read'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No notifications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {filter === 'unread'
                      ? "You're all caught up!"
                      : 'You have no notifications yet.'}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
