'use client';

import { type ReactNode, useMemo } from 'react';
import { Box, Avatar, Typography, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ComputerIcon from '@mui/icons-material/Computer';
import { DashboardLayout } from '../DashboardLayout';
import { type SidebarNavItem } from '../DashboardSidebar';
import { defaultConsoleMenuItems } from './consoleMenuConfig';

export interface ConsoleDashboardUser {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface ConsoleDashboardProps {
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
  user?: ConsoleDashboardUser;
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
  user?: ConsoleDashboardUser;
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar
          src={user.avatar}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'warning.main',
            fontSize: '0.75rem',
          }}
        >
          {initials}
        </Avatar>
        {onLogout && (
          <Tooltip title="Logout" placement="right">
            <IconButton size="small" onClick={onLogout}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar
        src={user.avatar}
        sx={{ width: 40, height: 40, bgcolor: 'warning.main' }}
      >
        {initials}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          fontWeight="medium"
          noWrap
          sx={{ color: 'text.primary' }}
        >
          {user.name}
        </Typography>
        <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
          {user.role || user.email}
        </Typography>
      </Box>
      {onLogout && (
        <Tooltip title="Logout">
          <IconButton size="small" onClick={onLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

function DefaultLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          bgcolor: 'warning.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <ComputerIcon fontSize="small" />
      </Box>
      {!collapsed && (
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          Console
        </Typography>
      )}
    </Box>
  );
}

export function ConsoleDashboard({
  children,
  menuItems,
  menuExtend,
  activeMenuKey,
  logo,
  title = 'Operations Console',
  headerActions,
  showSearch = true,
  onSearch,
  user,
  onLogout,
  footerCopyright = '© 2024 Operations Console. All rights reserved.',
  footerLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Guidelines', href: '/guidelines' },
  ],
  showFooter = true,
  sidebarCollapsed,
  onSidebarCollapse,
  className,
}: ConsoleDashboardProps) {
  // Merge menu items
  const finalMenuItems = useMemo(() => {
    if (menuItems) {
      return menuItems;
    }
    if (menuExtend) {
      return [...defaultConsoleMenuItems, ...menuExtend];
    }
    return defaultConsoleMenuItems;
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
