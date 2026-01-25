'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard';
import { RequireRole } from '@/components/auth';
import type { SidebarNavItem } from '@/components/dashboard';

// Icons
const DashboardIcon = () => (
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
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const ProfileIcon = () => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const OrdersIcon = () => (
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
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

const FavoritesIcon = () => (
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
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const NotificationsIcon = () => (
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
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const SettingsIcon = () => (
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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const memberNavItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/member/dashboard',
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: <ProfileIcon />,
    href: '/member/profile',
  },
  {
    key: 'orders',
    label: 'My Orders',
    icon: <OrdersIcon />,
    href: '/member/orders',
  },
  {
    key: 'favorites',
    label: 'Favorites',
    icon: <FavoritesIcon />,
    href: '/member/favorites',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <NotificationsIcon />,
    href: '/member/notifications',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    children: [
      {
        key: 'settings-security',
        label: 'Security',
        href: '/member/settings/security',
      },
      {
        key: 'settings-preferences',
        label: 'Preferences',
        href: '/member/settings/preferences',
      },
    ],
  },
];

interface MemberLayoutProps {
  children: ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const pathname = usePathname();

  // Get active key from pathname
  const getActiveKey = () => {
    if (pathname.includes('/member/dashboard')) return 'dashboard';
    if (pathname.includes('/member/profile')) return 'profile';
    if (pathname.includes('/member/orders')) return 'orders';
    if (pathname.includes('/member/favorites')) return 'favorites';
    if (pathname.includes('/member/notifications')) return 'notifications';
    if (pathname.includes('/member/settings/security'))
      return 'settings-security';
    if (pathname.includes('/member/settings/preferences'))
      return 'settings-preferences';
    if (pathname.includes('/member/settings')) return 'settings';
    return 'dashboard';
  };

  return (
    <RequireRole roles={['user', 'admin', 'super_admin']}>
      <DashboardLayout
        sidebarItems={memberNavItems}
        sidebarActiveKey={getActiveKey()}
        headerTitle="Member Portal"
        sidebarHeader={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <span className="text-sm font-bold">M</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Member
            </span>
          </div>
        }
        footerCopyright="© 2024 Your Company"
      >
        {children}
      </DashboardLayout>
    </RequireRole>
  );
}
