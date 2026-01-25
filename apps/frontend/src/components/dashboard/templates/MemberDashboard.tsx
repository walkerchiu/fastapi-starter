'use client';

import { type ReactNode, useMemo } from 'react';
import { DashboardLayout } from '../DashboardLayout';
import { type SidebarNavItem } from '../DashboardSidebar';
import { defaultMemberMenuItems } from './memberMenuConfig';

export interface MemberDashboardUser {
  name: string;
  email: string;
  avatar?: string;
}

export interface MemberDashboardProps {
  children: ReactNode;

  // Menu configuration (override defaults)
  menuItems?: SidebarNavItem[];
  menuExtend?: SidebarNavItem[];
  activeMenuKey?: string;

  // Header configuration
  logo?: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;

  // User info
  user?: MemberDashboardUser;
  onLogout?: () => void;

  // Footer configuration
  footerCopyright?: string;
  footerLinks?: Array<{ label: string; href: string }>;
  showFooter?: boolean;

  // Layout control
  sidebarCollapsed?: boolean;
  onSidebarCollapse?: (collapsed: boolean) => void;

  className?: string;
}

function UserFooter({
  user,
  onLogout,
  collapsed,
}: {
  user?: MemberDashboardUser;
  onLogout?: () => void;
  collapsed?: boolean;
}) {
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            title="Logout"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {user.name}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {user.email}
        </p>
      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title="Logout"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function DefaultLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
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
      </div>
      {!collapsed && (
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          Member
        </span>
      )}
    </div>
  );
}

export function MemberDashboard({
  children,
  menuItems,
  menuExtend,
  activeMenuKey,
  logo,
  title = 'Member Center',
  headerActions,
  showSearch = false,
  onSearch,
  user,
  onLogout,
  footerCopyright = '© 2024 All rights reserved.',
  footerLinks = [
    { label: 'Help', href: '/help' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
  showFooter = true,
  sidebarCollapsed,
  onSidebarCollapse,
  className,
}: MemberDashboardProps) {
  // Merge menu items
  const finalMenuItems = useMemo(() => {
    if (menuItems) {
      return menuItems;
    }
    if (menuExtend) {
      return [...defaultMemberMenuItems, ...menuExtend];
    }
    return defaultMemberMenuItems;
  }, [menuItems, menuExtend]);

  return (
    <DashboardLayout
      sidebarItems={finalMenuItems}
      sidebarActiveKey={activeMenuKey}
      sidebarHeader={logo || <DefaultLogo collapsed={sidebarCollapsed} />}
      sidebarFooter={
        <UserFooter
          user={user}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
        />
      }
      headerTitle={title}
      headerActions={headerActions}
      showSearch={showSearch}
      onSearch={onSearch}
      footerCopyright={footerCopyright}
      footerLinks={footerLinks}
      showFooter={showFooter}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapse={onSidebarCollapse}
      className={className}
    >
      {children}
    </DashboardLayout>
  );
}
