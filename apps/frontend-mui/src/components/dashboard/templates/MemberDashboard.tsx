'use client';

import { type ReactNode, useMemo } from 'react';
import { Box, Avatar, Typography, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
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
            bgcolor: 'success.main',
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
        sx={{ width: 40, height: 40, bgcolor: 'success.main' }}
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
          {user.email}
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
          bgcolor: 'success.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <PersonIcon fontSize="small" />
      </Box>
      {!collapsed && (
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          Member
        </Typography>
      )}
    </Box>
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
