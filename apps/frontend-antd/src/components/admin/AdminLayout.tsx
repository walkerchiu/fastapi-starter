'use client';

import { type ReactNode } from 'react';
import { Flex, Typography } from 'antd';
import {
  DashboardLayout,
  type DashboardLayoutProps,
} from '../dashboard/DashboardLayout';

const { Text } = Typography;

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
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            backgroundColor: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)',
            borderRadius: 8,
          }}
        >
          <Flex align="center" gap={12}>
            <Text strong style={{ color: 'var(--ant-color-text-secondary)' }}>
              Quick Actions:
            </Text>
            <Flex gap={8}>{quickActions}</Flex>
          </Flex>
        </div>
      )}
      {children}
    </DashboardLayout>
  );
}
