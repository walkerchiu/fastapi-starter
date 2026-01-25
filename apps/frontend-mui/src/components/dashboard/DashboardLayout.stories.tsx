import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from './DashboardLayout';
import { PageHeader } from './PageHeader';
import { PageSection } from './PageSection';
import { Button } from '../ui/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import NotificationsIcon from '@mui/icons-material/Notifications';

const sampleSidebarItems = [
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
    ],
  },
  {
    key: 'files',
    label: 'Files',
    icon: <FolderIcon />,
    href: '/files',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings',
  },
];

const Logo = () => (
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
);

const UserAvatar = () => <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>;

const SamplePageContent = () => (
  <>
    <PageHeader
      title="Dashboard"
      description="Welcome back! Here's what's happening."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
      actions={
        <Button variant="primary" size="sm">
          Create New
        </Button>
      }
    />
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Stat {i}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
              {i * 1234}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
    <PageSection title="Recent Activity">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Avatar>{i}</Avatar>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                Activity Item {i}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Description of the activity
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </PageSection>
  </>
);

const meta: Meta<typeof DashboardLayout> = {
  title: 'Dashboard/DashboardLayout',
  component: DashboardLayout,
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
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    headerActions: (
      <>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <UserAvatar />
      </>
    ),
    footerCopyright: '© 2025 Acme Inc. All rights reserved.',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
    children: <SamplePageContent />,
  },
};

export const WithoutSidebar: Story = {
  args: {
    showSidebar: false,
    headerLogo: <Logo />,
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const WithoutFooter: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    showFooter: false,
    children: <SamplePageContent />,
  },
};

export const Collapsed: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarCollapsed: true,
    headerLogo: <Logo />,
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const WithSearch: Story = {
  args: {
    sidebarItems: sampleSidebarItems,
    sidebarActiveKey: 'dashboard',
    sidebarHeader: <Logo />,
    headerLogo: <Logo />,
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    headerActions: <UserAvatar />,
    children: <SamplePageContent />,
  },
};

export const MinimalLayout: Story = {
  args: {
    showSidebar: false,
    showHeader: false,
    showFooter: false,
    children: (
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            Minimal Layout
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            No sidebar, header, or footer
          </Typography>
        </Box>
      </Box>
    ),
  },
};
