'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard';
import { RequireRole } from '@/components/auth';
import type { SidebarNavItem } from '@/components/dashboard';

// Icons
const OverviewIcon = () => (
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
      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
    />
  </svg>
);

const MembersIcon = () => (
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
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MerchantsIcon = () => (
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
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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

const ContentIcon = () => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const MarketingIcon = () => (
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
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
  </svg>
);

const AnalyticsIcon = () => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const ReportsIcon = () => (
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
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const operatorNavItems: SidebarNavItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <OverviewIcon />,
    href: '/dashboard/overview',
  },
  {
    key: 'members',
    label: 'Members',
    icon: <MembersIcon />,
    href: '/dashboard/members',
  },
  {
    key: 'merchants',
    label: 'Merchants',
    icon: <MerchantsIcon />,
    children: [
      {
        key: 'merchants-list',
        label: 'All Merchants',
        href: '/dashboard/merchants',
      },
      {
        key: 'merchants-pending',
        label: 'Pending Approval',
        href: '/dashboard/merchants/pending',
      },
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: <OrdersIcon />,
    href: '/dashboard/orders',
  },
  {
    key: 'content',
    label: 'Content',
    icon: <ContentIcon />,
    href: '/dashboard/content',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: <MarketingIcon />,
    children: [
      {
        key: 'marketing-campaigns',
        label: 'Campaigns',
        href: '/dashboard/marketing/campaigns',
      },
      {
        key: 'marketing-coupons',
        label: 'Coupons',
        href: '/dashboard/marketing/coupons',
      },
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: <AnalyticsIcon />,
    children: [
      {
        key: 'analytics-overview',
        label: 'Overview',
        href: '/dashboard/analytics',
      },
      {
        key: 'analytics-users',
        label: 'Users',
        href: '/dashboard/analytics/users',
      },
      {
        key: 'analytics-sales',
        label: 'Sales',
        href: '/dashboard/analytics/sales',
      },
      {
        key: 'analytics-traffic',
        label: 'Traffic',
        href: '/dashboard/analytics/traffic',
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <ReportsIcon />,
    href: '/dashboard/reports',
  },
];

interface OperatorLayoutProps {
  children: ReactNode;
}

export function OperatorLayout({ children }: OperatorLayoutProps) {
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname.includes('/dashboard/overview')) return 'overview';
    if (pathname.includes('/dashboard/members')) return 'members';
    if (pathname.includes('/dashboard/merchants/pending'))
      return 'merchants-pending';
    if (pathname.includes('/dashboard/merchants')) return 'merchants-list';
    if (pathname.includes('/dashboard/orders')) return 'orders';
    if (pathname.includes('/dashboard/content')) return 'content';
    if (pathname.includes('/dashboard/marketing/campaigns'))
      return 'marketing-campaigns';
    if (pathname.includes('/dashboard/marketing/coupons'))
      return 'marketing-coupons';
    if (pathname.includes('/dashboard/analytics/users'))
      return 'analytics-users';
    if (pathname.includes('/dashboard/analytics/sales'))
      return 'analytics-sales';
    if (pathname.includes('/dashboard/analytics/traffic'))
      return 'analytics-traffic';
    if (pathname.includes('/dashboard/analytics')) return 'analytics-overview';
    if (pathname.includes('/dashboard/reports')) return 'reports';
    return 'overview';
  };

  return (
    <RequireRole roles={['operator', 'admin', 'super_admin']}>
      <DashboardLayout
        sidebarItems={operatorNavItems}
        sidebarActiveKey={getActiveKey()}
        headerTitle="Operations Dashboard"
        sidebarHeader={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
              <span className="text-sm font-bold">O</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Operations
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
