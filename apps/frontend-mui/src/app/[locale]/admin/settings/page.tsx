'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure system settings"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'System', href: '/admin/settings' },
          { label: 'Settings' },
        ]}
      />
      <PageContent>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <PageSection title="General Settings">
              <Card>
                <CardHeader title="Application Settings" />
                <CardContent>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <TextField
                      label="Site Name"
                      defaultValue="My Application"
                      fullWidth
                    />
                    <TextField
                      label="Support Email"
                      type="email"
                      defaultValue="support@example.com"
                      fullWidth
                    />
                    <Button variant="contained">Save Changes</Button>
                  </Box>
                </CardContent>
              </Card>
            </PageSection>
          </Grid>

          <Grid item xs={12} lg={6}>
            <PageSection title="Security Settings">
              <Card>
                <CardHeader title="Security Options" />
                <CardContent>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography fontWeight="medium">
                          Two-Factor Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Require 2FA for all admin users
                        </Typography>
                      </Box>
                      <Switch defaultChecked />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography fontWeight="medium">
                          Session Timeout
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Auto logout after inactivity
                        </Typography>
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select defaultValue="30">
                          <MenuItem value="30">30 minutes</MenuItem>
                          <MenuItem value="60">1 hour</MenuItem>
                          <MenuItem value="240">4 hours</MenuItem>
                          <MenuItem value="480">8 hours</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </PageSection>
          </Grid>
        </Grid>
      </PageContent>
    </>
  );
}
