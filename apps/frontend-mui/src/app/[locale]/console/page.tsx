'use client';

import {
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

export default function ConsoleDashboardPage() {
  const stats = [
    { label: 'Pending Orders', value: '24', color: 'warning.main' },
    { label: 'Open Tickets', value: '8', color: 'error.main' },
    { label: 'Pending Reviews', value: '15', color: 'info.main' },
    { label: 'Processed Today', value: '142', color: 'success.main' },
  ];

  const recentActivities = [
    {
      action: 'Order #1234 processed',
      time: '5 min ago',
      type: 'order',
      icon: <ShoppingCartIcon />,
    },
    {
      action: 'Ticket #567 resolved',
      time: '12 min ago',
      type: 'ticket',
      icon: <ConfirmationNumberIcon />,
    },
    {
      action: 'Review approved for Product A',
      time: '25 min ago',
      type: 'review',
      icon: <CheckCircleIcon />,
    },
    {
      action: 'Refund issued for Order #1198',
      time: '1 hour ago',
      type: 'refund',
      icon: <RefreshIcon />,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'warning';
      case 'ticket':
        return 'info';
      case 'review':
        return 'success';
      case 'refund':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        description="Monitor and manage daily operations"
        breadcrumbs={[
          { label: 'Console', href: '/console' },
          { label: 'Dashboard' },
        ]}
      />
      <PageContent>
        <PageSection title="Today's Overview">
          <Grid container spacing={2}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} lg={3} key={stat.label}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={stat.color}
                    sx={{ mt: 0.5 }}
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
              {recentActivities.map((activity, index) => (
                <ListItem
                  key={index}
                  divider={index < recentActivities.length - 1}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${getTypeColor(activity.type)}.light`,
                        color: `${getTypeColor(activity.type)}.dark`,
                      }}
                    >
                      {activity.icon}
                    </Avatar>
                  </ListItemAvatar>
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
