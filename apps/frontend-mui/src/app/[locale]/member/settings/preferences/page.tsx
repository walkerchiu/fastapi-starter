'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

interface NotificationPreferences {
  email: {
    orders: boolean;
    promotions: boolean;
    newsletter: boolean;
    security: boolean;
  };
  push: {
    orders: boolean;
    promotions: boolean;
    reminders: boolean;
  };
}

export default function PreferencesPage() {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('system');
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: {
      orders: true,
      promotions: true,
      newsletter: false,
      security: true,
    },
    push: {
      orders: true,
      promotions: false,
      reminders: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleNotificationChange = (
    category: 'email' | 'push',
    key: string,
    value: boolean,
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  return (
    <>
      <PageHeader
        title="Preferences"
        description="Customize your experience"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings', href: '/member/settings' },
          { label: 'Preferences' },
        ]}
      />
      <PageContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Language & Region */}
          <PageSection title="Language & Region">
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      label="Language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="zh-TW">繁體中文</MenuItem>
                      <MenuItem value="zh-CN">简体中文</MenuItem>
                      <MenuItem value="ja">日本語</MenuItem>
                      <MenuItem value="ko">한국어</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      label="Timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">
                        Eastern Time (ET)
                      </MenuItem>
                      <MenuItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </MenuItem>
                      <MenuItem value="Europe/London">London (GMT)</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
                      <MenuItem value="Asia/Taipei">Taipei (CST)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      label="Currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                      <MenuItem value="GBP">GBP (£)</MenuItem>
                      <MenuItem value="JPY">JPY (¥)</MenuItem>
                      <MenuItem value="TWD">TWD (NT$)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </PageSection>

          {/* Appearance */}
          <PageSection title="Appearance">
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Theme
                </Typography>
                <ToggleButtonGroup
                  value={theme}
                  exclusive
                  onChange={(_, newTheme) => newTheme && setTheme(newTheme)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                    width: '100%',
                    maxWidth: 400,
                  }}
                >
                  <ToggleButton value="light" sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <LightModeIcon fontSize="small" />
                      <Typography variant="body2">Light</Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="dark" sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <DarkModeIcon fontSize="small" />
                      <Typography variant="body2">Dark</Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="system" sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <SettingsBrightnessIcon fontSize="small" />
                      <Typography variant="body2">System</Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </CardContent>
            </Card>
          </PageSection>

          {/* Email Notifications */}
          <PageSection title="Email Notifications">
            <Card>
              <CardContent sx={{ py: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Order Updates</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive emails about your order status
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.email.orders}
                    onChange={(e) =>
                      handleNotificationChange(
                        'email',
                        'orders',
                        e.target.checked,
                      )
                    }
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">
                      Promotions & Offers
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get notified about sales and special offers
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.email.promotions}
                    onChange={(e) =>
                      handleNotificationChange(
                        'email',
                        'promotions',
                        e.target.checked,
                      )
                    }
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Newsletter</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Weekly newsletter with curated content
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.email.newsletter}
                    onChange={(e) =>
                      handleNotificationChange(
                        'email',
                        'newsletter',
                        e.target.checked,
                      )
                    }
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Security Alerts</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Important security notifications
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.email.security}
                    onChange={(e) =>
                      handleNotificationChange(
                        'email',
                        'security',
                        e.target.checked,
                      )
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </PageSection>

          {/* Push Notifications */}
          <PageSection title="Push Notifications">
            <Card>
              <CardContent sx={{ py: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Order Updates</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Push notifications for order status changes
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.push.orders}
                    onChange={(e) =>
                      handleNotificationChange(
                        'push',
                        'orders',
                        e.target.checked,
                      )
                    }
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Promotions</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Flash sales and limited-time offers
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.push.promotions}
                    onChange={(e) =>
                      handleNotificationChange(
                        'push',
                        'promotions',
                        e.target.checked,
                      )
                    }
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Reminders</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cart reminders and wishlist notifications
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.push.reminders}
                    onChange={(e) =>
                      handleNotificationChange(
                        'push',
                        'reminders',
                        e.target.checked,
                      )
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </PageSection>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </Box>
      </PageContent>
    </>
  );
}
