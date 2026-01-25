'use client';

import { type ReactNode, useMemo } from 'react';
import { Avatar, Typography, Button, Space, Tooltip } from 'antd';
import { LogoutOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { DashboardLayout } from '../DashboardLayout';
import { type SidebarNavItem } from '../DashboardSidebar';
import { defaultAdminMenuItems } from './adminMenuConfig';

const { Text } = Typography;

export interface AdminDashboardUser {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface AdminDashboardProps {
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

  // User info (displayed in sidebar footer)
  user?: AdminDashboardUser;
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
  user?: AdminDashboardUser;
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Avatar
          src={user.avatar}
          style={{ backgroundColor: '#1677ff' }}
          size={32}
        >
          {initials}
        </Avatar>
        {onLogout && (
          <Tooltip title="Logout" placement="right">
            <Button
              type="text"
              size="small"
              icon={<LogoutOutlined />}
              onClick={onLogout}
            />
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar
        src={user.avatar}
        style={{ backgroundColor: '#1677ff', flexShrink: 0 }}
        size={40}
      >
        {initials}
      </Avatar>
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text strong style={{ display: 'block' }} ellipsis>
          {user.name}
        </Text>
        <Text
          type="secondary"
          style={{ fontSize: 12, display: 'block' }}
          ellipsis
        >
          {user.role || user.email}
        </Text>
      </div>
      {onLogout && (
        <Tooltip title="Logout">
          <Button
            type="text"
            size="small"
            icon={<LogoutOutlined />}
            onClick={onLogout}
          />
        </Tooltip>
      )}
    </div>
  );
}

function DefaultLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Space size={8} align="center">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: '#1677ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <SafetyCertificateOutlined style={{ fontSize: 18 }} />
      </div>
      {!collapsed && (
        <Text strong style={{ fontSize: 18 }}>
          Admin
        </Text>
      )}
    </Space>
  );
}

export function AdminDashboard({
  children,
  menuItems,
  menuExtend,
  activeMenuKey,
  logo,
  title = 'Admin Panel',
  headerActions,
  showSearch = true,
  onSearch,
  user,
  onLogout,
  footerCopyright = '© 2024 Admin Panel. All rights reserved.',
  footerLinks = [
    { label: 'Documentation', href: '/docs' },
    { label: 'Support', href: '/support' },
  ],
  showFooter = true,
  sidebarCollapsed,
  onSidebarCollapse,
  className,
}: AdminDashboardProps) {
  // Merge menu items
  const finalMenuItems = useMemo(() => {
    if (menuItems) {
      return menuItems;
    }
    if (menuExtend) {
      return [...defaultAdminMenuItems, ...menuExtend];
    }
    return defaultAdminMenuItems;
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
