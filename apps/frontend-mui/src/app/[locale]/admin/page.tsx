'use client';

import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Users', value: '1,234' },
    { label: 'Active Sessions', value: '56' },
    { label: 'Total Files', value: '789' },
    { label: 'System Health', value: '99.9%' },
  ];

  const recentActivities = [
    { action: 'User john@example.com created', time: '5 minutes ago' },
    { action: 'Role "Editor" updated', time: '1 hour ago' },
    { action: 'System backup completed', time: '3 hours ago' },
    { action: 'New file uploaded by admin', time: '5 hours ago' },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="System overview and quick stats"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Dashboard' },
        ]}
      />
      <PageContent>
        <PageSection title="Quick Stats">
          <Grid container spacing={2}>
            {stats.map((stat) => (
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

        <PageSection title="Recent Activity">
          <Paper>
            <List disablePadding>
              {recentActivities.map((activity, index) => (
                <ListItem
                  key={index}
                  divider={index < recentActivities.length - 1}
                >
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
}
