'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import {
  PageHeader,
  PageContent,
  PageSection,
  Timeline,
} from '@/components/dashboard';

const activities = [
  {
    id: '1',
    title: 'Password Changed',
    description: 'You changed your account password',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <KeyIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: '2',
    title: 'Profile Updated',
    description: 'You updated your profile information',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: '3',
    title: 'New Login Detected',
    description: 'New login from Chrome on macOS',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'warning' as const,
    icon: <ComputerIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: '4',
    title: '2FA Enabled',
    description: 'Two-factor authentication was enabled for your account',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <ShieldIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: '5',
    title: 'Account Created',
    description: 'Your account was created successfully',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    icon: <PersonAddIcon sx={{ fontSize: 16 }} />,
  },
];

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity Log"
        description="View your recent account activity"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Activity', href: '/member/activity' },
          { label: 'Activity Log' },
        ]}
      />
      <PageContent>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <PageSection title="Recent Activity">
              <Card>
                <CardContent>
                  <Timeline items={activities} />
                </CardContent>
              </Card>
            </PageSection>
          </Grid>

          <Grid item xs={12} lg={4}>
            <PageSection title="Activity Summary">
              <Card>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Total Activities
                      </Typography>
                      <Chip label={activities.length} size="small" />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Security Events
                      </Typography>
                      <Chip
                        label={
                          activities.filter((a) => a.status === 'warning')
                            .length
                        }
                        size="small"
                        color="warning"
                      />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Last 7 Days
                      </Typography>
                      <Chip
                        label={
                          activities.filter(
                            (a) =>
                              a.timestamp.getTime() >
                              Date.now() - 7 * 24 * 60 * 60 * 1000,
                          ).length
                        }
                        size="small"
                        color="info"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </PageSection>

            <Box sx={{ mt: 3 }}>
              <PageSection title="Export">
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Download your activity history for your records.
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      Export to CSV
                    </Button>
                  </CardContent>
                </Card>
              </PageSection>
            </Box>
          </Grid>
        </Grid>
      </PageContent>
    </>
  );
}
