import type { Meta, StoryObj } from '@storybook/react';
import {
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AdminDashboard } from './AdminDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const meta: Meta<typeof AdminDashboard> = {
  title: 'Dashboard/Templates/AdminDashboard',
  component: AdminDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Dashboard Overview"
      description="Welcome to the admin dashboard"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]}
    />
    <PageContent>
      <PageSection title="Quick Stats">
        <Grid container spacing={2}>
          {[
            { label: 'Total Users', value: '1,234' },
            { label: 'Active Sessions', value: '56' },
            { label: 'Total Files', value: '789' },
            { label: 'System Health', value: '99.9%' },
          ].map((stat) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.label}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </PageSection>
    </PageContent>
  </>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    activeMenuKey: 'dashboard',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Administrator',
    },
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    activeMenuKey: 'dashboard',
  },
};

export const WithAvatar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'Admin',
      avatar: 'https://i.pravatar.cc/150?u=admin',
    },
    activeMenuKey: 'dashboard',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'dashboard',
  },
};

export const WithExtendedMenu: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    menuExtend: [
      {
        key: 'custom-group',
        label: 'Custom',
        items: [
          {
            key: 'reports',
            label: 'Reports',
            href: '/admin/reports',
            icon: <AssessmentIcon />,
          },
          {
            key: 'analytics',
            label: 'Analytics',
            href: '/admin/analytics',
            icon: <TrendingUpIcon />,
          },
        ],
      },
    ],
    activeMenuKey: 'dashboard',
  },
};

export const WithCustomFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    footerCopyright: '© 2024 My Company. All rights reserved.',
    footerLinks: [
      { label: 'API Docs', href: '/api-docs' },
      { label: 'Status', href: '/status' },
      { label: 'Changelog', href: '/changelog' },
    ],
    activeMenuKey: 'dashboard',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    showFooter: false,
    activeMenuKey: 'dashboard',
  },
};

export const UsersPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Users"
          description="Manage user accounts"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'User Management', href: '/admin/users' },
            { label: 'Users' },
          ]}
          actions={
            <Button variant="contained" startIcon={<AddIcon />}>
              Add User
            </Button>
          }
        />
        <PageContent>
          <PageSection>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      name: 'Alice Johnson',
                      email: 'alice@example.com',
                      role: 'Admin',
                      status: 'Active',
                    },
                    {
                      name: 'Bob Smith',
                      email: 'bob@example.com',
                      role: 'User',
                      status: 'Active',
                    },
                    {
                      name: 'Carol Williams',
                      email: 'carol@example.com',
                      role: 'User',
                      status: 'Inactive',
                    },
                  ].map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={
                            user.status === 'Active' ? 'success' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'John Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
    },
    activeMenuKey: 'users',
  },
};
