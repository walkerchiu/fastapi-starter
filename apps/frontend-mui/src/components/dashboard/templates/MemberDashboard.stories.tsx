import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { MemberDashboard } from './MemberDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const meta: Meta<typeof MemberDashboard> = {
  title: 'Dashboard/Templates/MemberDashboard',
  component: MemberDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MemberDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Welcome Back!"
      description="Here's what's happening with your account"
      breadcrumbs={[
        { label: 'Member', href: '/member' },
        { label: 'Overview' },
      ]}
    />
    <PageContent>
      <PageSection title="Account Summary">
        <Grid container spacing={2}>
          {[
            { label: 'Account Status', value: 'Active', color: 'success' },
            { label: 'Member Since', value: 'Jan 2024', color: 'info' },
            { label: 'Last Login', value: '2 hours ago', color: 'default' },
          ].map((stat) => (
            <Grid item xs={12} sm={6} lg={4} key={stat.label}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mt: 0.5 }}
                  color={
                    stat.color === 'success'
                      ? 'success.main'
                      : stat.color === 'info'
                        ? 'info.main'
                        : 'text.primary'
                  }
                >
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </PageSection>
      <PageSection title="Recent Activity">
        <Paper>
          <List disablePadding>
            {[
              { action: 'Logged in', time: '2 hours ago' },
              { action: 'Updated profile', time: '1 day ago' },
              { action: 'Changed password', time: '3 days ago' },
            ].map((activity, index) => (
              <ListItem key={index} divider={index < 2}>
                <ListItemText
                  primary={activity.action}
                  secondary={activity.time}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </PageSection>
    </PageContent>
  </>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'overview',
  },
};

export const WithAvatar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
      avatar: 'https://i.pravatar.cc/150?u=member',
    },
    activeMenuKey: 'overview',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'overview',
  },
};

export const WithExtendedMenu: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    menuExtend: [
      {
        key: 'rewards-group',
        label: 'Rewards',
        items: [
          {
            key: 'points',
            label: 'My Points',
            href: '/member/points',
            badge: 1250,
            icon: <MonetizationOnIcon />,
          },
          {
            key: 'rewards',
            label: 'Redeem Rewards',
            href: '/member/rewards',
            icon: <CardGiftcardIcon />,
          },
        ],
      },
    ],
    activeMenuKey: 'overview',
  },
};

export const ProfilePage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Profile"
          description="Manage your personal information"
          breadcrumbs={[
            { label: 'Member', href: '/member' },
            { label: 'Account', href: '/member/profile' },
            { label: 'Profile' },
          ]}
        />
        <PageContent>
          <PageSection>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'success.main',
                    fontSize: '1.5rem',
                  }}
                >
                  JU
                </Avatar>
                <Box>
                  <Typography variant="h6">Jane User</Typography>
                  <Typography variant="body2" color="text.secondary">
                    jane@example.com
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" defaultValue="Jane" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name" defaultValue="User" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    defaultValue="jane@example.com"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="success">
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'profile',
  },
};

export const SecurityPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Security"
          description="Manage your security settings"
          breadcrumbs={[
            { label: 'Member', href: '/member' },
            { label: 'Account', href: '/member/security' },
            { label: 'Security' },
          ]}
        />
        <PageContent>
          <PageSection title="Password">
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Last changed 30 days ago
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Change Password
              </Button>
            </Paper>
          </PageSection>
          <PageSection title="Two-Factor Authentication">
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography fontWeight="medium">Authenticator App</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use an authenticator app to generate codes
                  </Typography>
                </Box>
                <Chip label="Enabled" color="success" size="small" />
              </Box>
            </Paper>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    activeMenuKey: 'security',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    activeMenuKey: 'overview',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Jane User',
      email: 'jane@example.com',
    },
    showFooter: false,
    activeMenuKey: 'overview',
  },
};
