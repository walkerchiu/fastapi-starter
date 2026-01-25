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

const AppsIcon = () => (
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
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const ApiKeysIcon = () => (
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
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const WebhooksIcon = () => (
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
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const DocsIcon = () => (
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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const SandboxIcon = () => (
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
      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const LogsIcon = () => (
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

const developerNavItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/developer/dashboard',
  },
  {
    key: 'apps',
    label: 'My Apps',
    icon: <AppsIcon />,
    href: '/developer/apps',
  },
  {
    key: 'api-keys',
    label: 'API Keys',
    icon: <ApiKeysIcon />,
    href: '/developer/api-keys',
  },
  {
    key: 'webhooks',
    label: 'Webhooks',
    icon: <WebhooksIcon />,
    href: '/developer/webhooks',
  },
  {
    key: 'docs',
    label: 'Documentation',
    icon: <DocsIcon />,
    href: '/developer/docs',
  },
  {
    key: 'sandbox',
    label: 'API Sandbox',
    icon: <SandboxIcon />,
    href: '/developer/sandbox',
  },
  {
    key: 'logs',
    label: 'API Logs',
    icon: <LogsIcon />,
    href: '/developer/logs',
  },
];

interface DeveloperLayoutProps {
  children: ReactNode;
}

export function DeveloperLayout({ children }: DeveloperLayoutProps) {
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname.includes('/developer/dashboard')) return 'dashboard';
    if (pathname.includes('/developer/apps')) return 'apps';
    if (pathname.includes('/developer/api-keys')) return 'api-keys';
    if (pathname.includes('/developer/webhooks')) return 'webhooks';
    if (pathname.includes('/developer/docs')) return 'docs';
    if (pathname.includes('/developer/sandbox')) return 'sandbox';
    if (pathname.includes('/developer/logs')) return 'logs';
    return 'dashboard';
  };

  return (
    <RequireRole roles={['developer', 'admin', 'super_admin']}>
      <DashboardLayout
        sidebarItems={developerNavItems}
        sidebarActiveKey={getActiveKey()}
        headerTitle="Developer Portal"
        sidebarHeader={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600 text-white">
              <span className="text-sm font-bold">D</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Developer
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
