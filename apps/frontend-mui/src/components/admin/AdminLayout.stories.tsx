import type { Meta, StoryObj } from '@storybook/react';
import { AdminLayout } from './AdminLayout';
import { Button, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';

const meta: Meta<typeof AdminLayout> = {
  title: 'Admin/AdminLayout',
  component: AdminLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdminLayout>;

const sampleSidebarItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'users', label: 'Users', href: '/admin/users' },
  { key: 'settings', label: 'Settings', href: '/admin/settings' },
];

export const Default: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    children: (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard Content
        </Typography>
        <Typography color="text.secondary">
          This is the main content area of the admin layout.
        </Typography>
      </Box>
    ),
  },
};

export const WithQuickActions: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    showQuickActions: true,
    quickActions: (
      <>
        <Button variant="contained" size="small" startIcon={<AddIcon />}>
          Add User
        </Button>
        <Button variant="outlined" size="small" startIcon={<RefreshIcon />}>
          Refresh
        </Button>
        <Button variant="outlined" size="small" startIcon={<SettingsIcon />}>
          Settings
        </Button>
      </>
    ),
    children: (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard with Quick Actions
        </Typography>
        <Typography color="text.secondary">
          The quick actions bar appears above the content.
        </Typography>
      </Box>
    ),
  },
};

export const WithoutQuickActions: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'users',
    showQuickActions: false,
    children: (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Users Management
        </Typography>
        <Typography color="text.secondary">
          Quick actions are hidden in this view.
        </Typography>
      </Box>
    ),
  },
};
