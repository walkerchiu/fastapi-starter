import type { Meta, StoryObj } from '@storybook/react';
import { DashboardSidebar } from './DashboardSidebar';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import NotificationsIcon from '@mui/icons-material/Notifications';

const sampleItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/dashboard',
  },
  {
    key: 'users',
    label: 'Users',
    icon: <PeopleIcon />,
    children: [
      { key: 'users-list', label: 'User List', href: '/users' },
      { key: 'users-roles', label: 'Roles', href: '/users/roles' },
      {
        key: 'users-permissions',
        label: 'Permissions',
        href: '/users/permissions',
      },
    ],
  },
  {
    key: 'files',
    label: 'Files',
    icon: <FolderIcon />,
    href: '/files',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <NotificationsIcon />,
    href: '/notifications',
    badge: 5,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings',
    disabled: true,
  },
];

const groupedItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/dashboard',
  },
  {
    key: 'management-group',
    label: 'Management',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: <PeopleIcon />,
        href: '/users',
      },
      {
        key: 'files',
        label: 'Files',
        icon: <FolderIcon />,
        href: '/files',
      },
    ],
  },
  {
    key: 'system-group',
    label: 'System',
    items: [
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        href: '/settings',
      },
      {
        key: 'notifications',
        label: 'Notifications',
        icon: <NotificationsIcon />,
        href: '/notifications',
        badge: 3,
      },
    ],
  },
];

const meta: Meta<typeof DashboardSidebar> = {
  title: 'Dashboard/DashboardSidebar',
  component: DashboardSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    onCollapse: undefined,
  },
};

export const Collapsed: Story = {
  args: {
    items: sampleItems,
    collapsed: true,
    activeKey: 'dashboard',
  },
};

export const WithGroups: Story = {
  args: {
    items: groupedItems,
    activeKey: 'users',
  },
};

export const NestedMenu: Story = {
  args: {
    items: sampleItems,
    activeKey: 'users-list',
  },
};

export const WithBadges: Story = {
  args: {
    items: sampleItems,
    activeKey: 'notifications',
  },
};

export const WithHeader: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    header: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: 'primary.main',
          }}
        />
        <Typography variant="subtitle1" fontWeight="bold">
          Acme Inc
        </Typography>
      </Box>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    footer: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            John Doe
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            john@example.com
          </Typography>
        </Box>
      </Box>
    ),
  },
};

export const WithCollapseControl: Story = {
  args: {
    items: sampleItems,
    activeKey: 'dashboard',
    onCollapse: () => {},
    header: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: 'primary.main',
          }}
        />
        <Typography variant="subtitle1" fontWeight="bold">
          Acme Inc
        </Typography>
      </Box>
    ),
  },
};
