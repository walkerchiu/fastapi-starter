'use client';

import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Update your personal information, avatar, and bio',
    href: '/member/profile',
    icon: <PersonIcon />,
  },
  {
    id: 'security',
    title: 'Security',
    description:
      'Manage your password, two-factor authentication, and sessions',
    href: '/member/security',
    icon: <SecurityIcon />,
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize language, theme, and notification settings',
    href: '/member/settings/preferences',
    icon: <SettingsIcon />,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'View and manage your notifications',
    href: '/member/notifications',
    icon: <NotificationsIcon />,
  },
  {
    id: 'addresses',
    title: 'Addresses',
    description: 'Manage your shipping and billing addresses',
    href: '/member/addresses',
    icon: <LocationOnIcon />,
  },
  {
    id: 'payment',
    title: 'Payment Methods',
    description: 'Add and manage your payment methods',
    href: '/member/payment',
    icon: <CreditCardIcon />,
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings' },
        ]}
      />
      <PageContent>
        <PageSection>
          <Grid container spacing={2}>
            {settingsCategories.map((category) => (
              <Grid item xs={12} sm={6} lg={4} key={category.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={category.href}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            width: 48,
                            height: 48,
                          }}
                        >
                          {category.icon}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight="medium">
                            {category.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {category.description}
                          </Typography>
                        </Box>
                        <ChevronRightIcon color="action" />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </PageSection>

        {/* Danger Zone */}
        <Box sx={{ mt: 4 }}>
          <PageSection title="Danger Zone">
            <Card
              sx={{
                borderColor: 'error.light',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium" color="error.main">
                      Delete Account
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </Typography>
                  </Box>
                  <Button variant="outlined" color="error">
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </PageSection>
        </Box>
      </PageContent>
    </>
  );
}
