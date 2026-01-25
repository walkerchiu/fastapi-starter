'use client';

import { type ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
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
        <Paper
          variant="outlined"
          sx={{
            mb: 3,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Typography
            variant="body2"
            fontWeight="medium"
            color="text.secondary"
          >
            Quick Actions:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {quickActions}
          </Box>
        </Paper>
      )}
      {children}
    </DashboardLayout>
  );
}
