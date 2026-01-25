'use client';

import { useSession } from 'next-auth/react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

export default function MemberDashboardPage() {
  const { data: session } = useSession();

  const accountInfo = [
    { label: 'Account Status', value: 'Active', color: 'success.main' },
    { label: 'Member Since', value: 'Jan 2024', color: 'primary.main' },
    { label: 'Last Login', value: '2 hours ago', color: 'primary.main' },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      href: '/member/profile',
      icon: <PersonIcon />,
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords and 2FA',
      href: '/member/security',
      icon: <SecurityIcon />,
    },
    {
      title: 'Activity Log',
      description: 'View your recent activities',
      href: '/member/activity',
      icon: <HistoryIcon />,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${session?.user?.name || 'Member'}`}
        description="Manage your account and preferences"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Overview' },
        ]}
      />
      <PageContent>
        <PageSection title="Account Overview">
          <Grid container spacing={2}>
            {accountInfo.map((info) => (
              <Grid item xs={12} sm={4} key={info.label}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {info.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={info.color}
                    sx={{ mt: 0.5 }}
                  >
                    {info.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </PageSection>

        <PageSection title="Quick Actions">
          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid item xs={12} sm={4} key={action.title}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'success.light',
                          color: 'success.dark',
                          width: 48,
                          height: 48,
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </PageSection>
      </PageContent>
    </>
  );
}
