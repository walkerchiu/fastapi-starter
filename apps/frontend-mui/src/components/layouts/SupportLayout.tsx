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

const TicketsIcon = () => (
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
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);

const ChatIcon = () => (
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
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const CustomersIcon = () => (
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
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const KnowledgeBaseIcon = () => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const supportNavItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/support/dashboard',
  },
  {
    key: 'tickets',
    label: 'Tickets',
    icon: <TicketsIcon />,
    href: '/support/tickets',
  },
  {
    key: 'chat',
    label: 'Live Chat',
    icon: <ChatIcon />,
    href: '/support/chat',
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: <CustomersIcon />,
    href: '/support/customers',
  },
  {
    key: 'knowledge-base',
    label: 'Knowledge Base',
    icon: <KnowledgeBaseIcon />,
    href: '/support/knowledge-base',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <ReportsIcon />,
    href: '/support/reports',
  },
];

interface SupportLayoutProps {
  children: ReactNode;
}

export function SupportLayout({ children }: SupportLayoutProps) {
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname.includes('/support/dashboard')) return 'dashboard';
    if (pathname.includes('/support/tickets')) return 'tickets';
    if (pathname.includes('/support/chat')) return 'chat';
    if (pathname.includes('/support/customers')) return 'customers';
    if (pathname.includes('/support/knowledge-base')) return 'knowledge-base';
    if (pathname.includes('/support/reports')) return 'reports';
    return 'dashboard';
  };

  return (
    <RequireRole roles={['support', 'admin', 'super_admin']}>
      <DashboardLayout
        sidebarItems={supportNavItems}
        sidebarActiveKey={getActiveKey()}
        headerTitle="Support Portal"
        sidebarHeader={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white">
              <span className="text-sm font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Support
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
