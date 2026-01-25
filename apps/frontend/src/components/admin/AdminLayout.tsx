'use client';

import { type ReactNode } from 'react';
import {
  DashboardLayout,
  type DashboardLayoutProps,
} from '../dashboard/DashboardLayout';

export interface AdminLayoutProps extends DashboardLayoutProps {
  showQuickActions?: boolean;
  quickActions?: ReactNode;
}

export function AdminLayout({
  children,
  showQuickActions = true,
  quickActions,
  ...props
}: AdminLayoutProps) {
  return (
    <DashboardLayout {...props}>
      {showQuickActions && quickActions && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Actions:
          </span>
          <div className="flex items-center gap-2">{quickActions}</div>
        </div>
      )}
      {children}
    </DashboardLayout>
  );
}
