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

const UsersIcon = () => (
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

const RolesIcon = () => (
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
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const PermissionsIcon = () => (
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

const FilesIcon = () => (
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
      d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
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

const MaintenanceIcon = () => (
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

const adminNavItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/admin',
  },
  {
    key: 'user-management',
    label: 'User Management',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: <UsersIcon />,
        href: '/admin/users',
      },
      {
        key: 'roles',
        label: 'Roles',
        icon: <RolesIcon />,
        href: '/admin/roles',
      },
      {
        key: 'permissions',
        label: 'Permissions',
        icon: <PermissionsIcon />,
        href: '/admin/permissions',
      },
    ],
  },
  {
    key: 'content',
    label: 'Content',
    items: [
      {
        key: 'files',
        label: 'Files',
        icon: <FilesIcon />,
        href: '/admin/files',
      },
    ],
  },
  {
    key: 'system',
    label: 'System',
    items: [
      {
        key: 'logs',
        label: 'Audit Logs',
        icon: <LogsIcon />,
        href: '/admin/logs',
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        children: [
          {
            key: 'settings-general',
            label: 'General',
            href: '/admin/settings/general',
          },
          {
            key: 'settings-email',
            label: 'Email',
            href: '/admin/settings/email',
          },
          {
            key: 'settings-storage',
            label: 'Storage',
            href: '/admin/settings/storage',
          },
          {
            key: 'settings-security',
            label: 'Security',
            href: '/admin/settings/security',
          },
        ],
      },
      {
        key: 'maintenance',
        label: 'Maintenance',
        icon: <MaintenanceIcon />,
        children: [
          {
            key: 'maintenance-cache',
            label: 'Cache',
            href: '/admin/maintenance/cache',
          },
          {
            key: 'maintenance-jobs',
            label: 'Jobs',
            href: '/admin/maintenance/jobs',
          },
        ],
      },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname === '/admin' || pathname.endsWith('/admin/'))
      return 'dashboard';
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/roles')) return 'roles';
    if (pathname.includes('/admin/permissions')) return 'permissions';
    if (pathname.includes('/admin/files')) return 'files';
    if (pathname.includes('/admin/logs')) return 'logs';
    if (pathname.includes('/admin/settings/general')) return 'settings-general';
    if (pathname.includes('/admin/settings/email')) return 'settings-email';
    if (pathname.includes('/admin/settings/storage')) return 'settings-storage';
    if (pathname.includes('/admin/settings/security'))
      return 'settings-security';
    if (pathname.includes('/admin/settings')) return 'settings';
    if (pathname.includes('/admin/maintenance/cache'))
      return 'maintenance-cache';
    if (pathname.includes('/admin/maintenance/jobs')) return 'maintenance-jobs';
    if (pathname.includes('/admin/maintenance')) return 'maintenance';
    return 'dashboard';
  };

  return (
    <RequireRole roles={['admin', 'super_admin']}>
      <DashboardLayout
        sidebarItems={adminNavItems}
        sidebarActiveKey={getActiveKey()}
        headerTitle="Admin Panel"
        sidebarHeader={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <span className="text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Admin
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
